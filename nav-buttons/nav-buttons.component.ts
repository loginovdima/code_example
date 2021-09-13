//#region libraries import
...
//#endregion

//#region foss-manager import
...
//#endregion

//#region project import
...
//#endregion

@Component({
  selector: 'slpt-nav-buttons',
  templateUrl: './nav-buttons.component.html',
  styleUrls: ['./nav-buttons.component.scss'],
  providers: [AdjustService, CalculationService]
})
export class NavButtonsComponent implements OnInit, OnDestroy {
  public nextStepIsValid = false;
  public isSaveButtonAvailable = false;

  public currentStep = 0;

  public maxStepNumber = 0;

  public acceptedAdjustments = [];

  public selectedNodes = [];

  private isSaveButtonAvailableSubscription: Subscription;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    public dialog: MatDialog,
    private adjustService: AdjustService,
    private store: Store<RootStoreState.State>,
    private translateService: TranslateService,
    private stepperService: StepperService
  ) {}

  ngOnInit(): void {
    this.currentStep = this.stepperService.currentStep;
    this.maxStepNumber = this.stepperService.getMaxStepNumber - 1;
    this.stepperService.currentStep$
      .pipe(
        filter((currentStep: number) => this.currentStep !== currentStep),
        takeUntil(this.destroy$)
      )
      .subscribe((currentStep: number) => {
        this.currentStep = currentStep;
      });

    this.stepperService.isNextStepValid$.pipe(takeUntil(this.destroy$)).subscribe((isValid: boolean) => {
      this.nextStepIsValid = isValid;
    });

    this.isSaveButtonAvailableSubscription = this.checkIsSaveButtonAvailable$().subscribe(
      (isAvailable: boolean) => (this.isSaveButtonAvailable = isAvailable)
    );
  }

  ngOnDestroy(): void {
    this.isSaveButtonAvailableSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  public save(): void {
    const dialogRef = this.dialog.open(MaterialDialogMessageComponent, {
      data: {
        title: this.translateService.instant('SaveChangesTitle'),
        message: this.translateService.instant('SaveChangesText'),
        dialogType: DialogType.Warning,
        buttons: [DialogButtons.Yes, DialogButtons.No, DialogButtons.Cancel]
      }
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((button: DialogButtons) => {
        if (button === DialogButtons.Yes) {
          this.adjustService.saveAcceptedAdjustments();
        }
      });
  }

  public checkIsSaveButtonAvailable$(): Observable<boolean> {
    return this.store.pipe(
      select(selectAcceptedAdjustments),
      map((adjustments: CalculationUIModel[]) => {
        const adjustmentsWithErrorStatus = [];
        adjustments.forEach((adjustment) => {
          if (!!adjustment.adjustmentStatus && adjustment.adjustmentStatus === AdjustmentStatus.error) {
            adjustmentsWithErrorStatus.push(adjustment);
          }
        });

        return adjustments.length > 0 && adjustmentsWithErrorStatus.length === 0;
      })
    );
  }

  public setCurrentStep(next: boolean): void {
    this.stepperService
      .handleNextStep(this.currentStep, next)
      .pipe(takeUntil(this.destroy$))
      .subscribe((step: number) => {
        this.currentStep = step;
        this.stepperService.currentStep = this.currentStep;
      });
  }
}
