//#region libraries import
...
//#endregion

//#region foss-manager import
...
//#endregion

//#region project import
...
//#endregion

@Injectable()
export class AdjustmentAreaService implements OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  private currentPredictionModel: PredictionModelExpanded;
  private selectedRowByPropertyMap = new Map<number, number | string>();
  private _currentPredictionModel$ = new BehaviorSubject<PredictionModelExpanded>;

  constructor(
    private store: Store<RootStoreState.State>,
    private sampleSetService: SampleSetService,
    private translateService: TranslateService,
    private decimalPipe: DecimalPipe,
    private predictionModelService: PredictionModelService
  ) {}

  public get getCurrentPredictionModel$(): Observable<PredictionModelExpanded> {
    return this._currentPredictionModel$.asObservable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearAdjusmentHistory());
  }

  public getSelectedSampleRow(calcIndex: number): number | string {
    return this.selectedRowByPropertyMap.get(calcIndex);
  }

  public setSelectedSampleRow(calcIndex: number, propertyValue: number | string): void {
    this.selectedRowByPropertyMap.set(calcIndex, propertyValue);
  }

  public getCurrentPredictionModelTypeID(): number {
    return this.currentPredictionModel.type.predictionModelTypeID;
  }

  public getStatisticsUIModel(calculation: CalculationUIModel): StatisticsUI[] {
    const statistics: StatisticsUI[] = [];
    calculation.adjustments.forEach((adjustment: SlopeInterceptAdjustment) => {
      if (adjustment.adjustmentType === AdjustmentTypeEnum.KeepCurrent) {
        const statistic = this.mapCalculationsToStatisticUI(
          adjustment,
          StatisticStateEnum.Current,
          calculation.adjustmentStatus,
          calculation.adjustmentResult,
          calculation.numberOfDecimals,
          calculation.calculatedAtUTC
        );
        statistics.push(statistic);
      }
      if (adjustment.adjustmentType === calculation.selectedAdjustmentType) {
        const statistic = this.mapCalculationsToStatisticUI(
          adjustment,
          StatisticStateEnum.Calculated,
          calculation.adjustmentStatus,
          calculation.adjustmentResult,
          calculation.numberOfDecimals,
          calculation.calculatedAtUTC
        );
        statistics.push(statistic);
      }
    });

    return statistics;
  }

  public getCurrentAdjustmentResult$(): Observable<CalculationUIModel> {
    return this.store.pipe(
      select(getSelectedCalculation),
      filter((calc: CalculationUIModel): boolean => !!calc),
      takeUntil(this.destroy$)
    );
  }

  public getCurrentSIMethod$(): Observable<SlopeInterceptMethodEnum> {
    return this.store.pipe(select(selectCurrentSlopeInterceptMethod), takeUntil(this.destroy$));
  }

  public getCurrentSampleSet$(): Observable<SampleSetExpanded> {
    return this.store.pipe(
      select(selectFullSampleSetForSIAdjustment),
      filter((ss: SampleSetExpanded): boolean => !!ss),
      take(1)
    );
  }

  public getCurrentNetworkID$(): Observable<string> {
    return this.store.pipe(
      select(selectCurrentDiscoveryNetworkID),
      filter((id: string): boolean => !!id),
      take(1)
    );
  }

  public getRefValuesRelevantToCalcResult$(): Observable<SampleWithReferenceValuesSI[]> {
    return this.store.pipe(
      select(selectRefValuesByCalculationResult),
      map((refValues: SampleWithReferenceValuesSI[]): SampleWithReferenceValuesSI[] =>
        this.filterOutReplicatesWithDifferentRefValues(refValues)
      ),
      takeUntil(this.destroy$)
    );
  }

  public getIndividualCalcPointsSetting$(): Observable<{ showReplicates: boolean; useReplicates: boolean }> {
    return this.getCurrentAdjustmentResult$().pipe(
      switchMap((calculation: CalculationUIModel) =>
        defer(() =>
          calculation.parameter.predictionModel.predictionModelID === this.currentPredictionModel?.predictionModelID
            ? of(this.getParameterSettingsFromPM(this.currentPredictionModel, calculation.parameter.parameterID))
            : this.getSettingsFromNewPredictionModel$(
                calculation.parameter.predictionModel.predictionModelID,
                calculation.parameter.parameterID
              ).pipe(take(1))
        )
      ),
      takeUntil(this.destroy$)
    );
  }

  public getSampleIDsDataRelevantToCalcResult$(): Observable<{
    includedSampleIDs: number[];
    excludedSampleIDs: number[];
  }> {
    return this.store.pipe(
      select(selectSampleIDsDataByCurrentAdjustment),
      filter((data: { includedSampleIDs: number[]; excludedSampleIDs: number[] }) => !!data),
      takeUntil(this.destroy$)
    );
  }

  private mapCalculationsToStatisticUI(
    adjustment: SlopeInterceptAdjustment,
    state: StatisticStateEnum,
    adjustmentStatus: string,
    adjustmentResult: string,
    numberOfDecimals: number,
    calculatedAtUTC?: Date
  ): StatisticsUI {
    const hasRepeatabilityAbsValue =
      adjustment.statistics?.repeatabilityAbs && Number.isFinite(adjustment.statistics?.repeatabilityAbs);
    const hasRepeatabilityRelValue =
      adjustment.statistics?.repeatabilityRel && Number.isFinite(adjustment.statistics?.repeatabilityRel);
    return {
      state: state,
      slope: adjustment.slope,
      intercept: adjustment.intercept,
      accuracyAbs: adjustment.statistics?.accuracyAbs,
      accuracyRel: adjustment.statistics?.accuracyRel,
      accuracy: adjustment.statistics?.accuracyType,
      correlation: adjustment.statistics?.correlation,
      repeatabilityAbs: hasRepeatabilityAbsValue ? adjustment.statistics?.repeatabilityAbs : '-',
      repeatabilityRel: hasRepeatabilityRelValue ? adjustment.statistics?.repeatabilityRel : '-',
      adjustmentStatus: adjustmentStatus,
      adjustmentResult: adjustmentResult,
      numberOfDecimals: numberOfDecimals,
      calculatedAtUTC: calculatedAtUTC
    };
  }

  private filterOutReplicatesWithDifferentRefValues(
    refValues: SampleWithReferenceValuesSI[]
  ): SampleWithReferenceValuesSI[] {
    return refValues.filter((refValue: SampleWithReferenceValuesSI): boolean => {
      const replicateRefValues = refValues
        .filter((v: SampleWithReferenceValuesSI): boolean => v.sampleNumber === refValue.sampleNumber)
        .map((value: SampleWithReferenceValuesSI): number => value.adjustmentParameter.referenceValue.value);
      return !replicateRefValues.some(
        (value: number): boolean => value !== refValue.adjustmentParameter.referenceValue.value
      );
    });
  }

  private getSettingsFromNewPredictionModel$(
    predictionModelID: number,
    parameterID: number
  ): Observable<{ showReplicates: boolean; useReplicates: boolean }> {
    return this.getCurrentNetworkID$().pipe(
      switchMap((networkID: string) => this.predictionModelService.getPredictionModel(networkID, predictionModelID)),
      pluck('data'),
      tap((pm: PredictionModelExpanded) => {
        this.currentPredictionModel = JSON.parse(JSON.stringify(pm));
        this._currentPredictionModel$.next(this.currentPredictionModel);
      }),
      map((pm: PredictionModelExpanded) => this.getParameterSettingsFromPM(pm, parameterID)),
      take(1)
    );
  }

  private getParameterSettingsFromPM(
    pm: PredictionModelExpanded,
    parameterID: number
  ): { showReplicates: boolean; useReplicates: boolean } {
    const adjustedParameter = pm.parameters.find((p: ParameterExpanded) => p.parameterID === parameterID);
    const siUseReplicatesSetting = adjustedParameter.settingGroups
      .find((sg) => sg.identification === 'PostPrediction:SlopeInterceptCalculationSettings')
      .settings.find((s) => s.identification === 'UseReplicates');
    const useReplicatesChecked = !!siUseReplicatesSetting.numericValue;

    if (useReplicatesChecked) {
      this.currentShowReplicates = useReplicatesChecked;
    } else {
      this.currentShowReplicates = this.previousShowReplicates || useReplicatesChecked;
      this.previousShowReplicates = this.currentShowReplicates;
    }

    return { showReplicates: this.currentShowReplicates, useReplicates: useReplicatesChecked };
  }
}
