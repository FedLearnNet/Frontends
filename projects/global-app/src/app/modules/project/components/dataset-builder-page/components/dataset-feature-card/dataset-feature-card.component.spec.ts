import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {DatasetFeatureCardComponent} from './dataset-feature-card.component';

describe('DatasetFeatureCardComponent', () => {
  let component: DatasetFeatureCardComponent;
  let fixture: ComponentFixture<DatasetFeatureCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetFeatureCardComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetFeatureCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('feature', {
      name: 'BMI',
      order: 0,
      allowedDataIds: [],
    });
    fixture.componentRef.setInput('selectionOptions', []);
    fixture.detectChanges();
  });

  it('emits an empty intermediate feature name', () => {
    const emittedNames: string[] = [];
    component.nameChanged.subscribe(name => emittedNames.push(name));

    component.updateName('');

    expect(emittedNames).toEqual(['']);
  });

  it('uses the active dragged selection when the browser strips custom transfer data', () => {
    const selection = {
      globalOntologyId: 'ontology-1',
      globalDataTypeId: 'datatype-1',
    };
    fixture.componentRef.setInput('draggedSelection', selection);
    const emittedSelections: typeof selection[] = [];
    component.selectionAdded.subscribe(value => emittedSelections.push(value));
    const event = {
      dataTransfer: {getData: () => ''},
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
    } as unknown as DragEvent;

    component.handleNativeDrop(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(emittedSelections).toEqual([selection]);
  });
});
