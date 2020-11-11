/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { act } from 'react-dom/test-utils';
import { shallow, mount } from 'enzyme';
import { EuiRange, EuiSelect } from '@elastic/eui';
import { IUiSettingsClient, SavedObjectsClientContract, HttpSetup } from 'kibana/public';
import { IStorageWrapper } from 'src/plugins/kibana_utils/public';
import { dataPluginMock } from '../../../../../../../../src/plugins/data/public/mocks';
import { createMockedIndexPattern } from '../../../mocks';
import { ValuesRangeInput } from './values_range_input';
import { TermsIndexPatternColumn } from '.';
import { termsOperation } from '../index';
import { IndexPatternPrivateState, IndexPattern } from '../../../types';

const defaultProps = {
  storage: {} as IStorageWrapper,
  uiSettings: {} as IUiSettingsClient,
  savedObjectsClient: {} as SavedObjectsClientContract,
  dateRange: { fromDate: 'now-1d', toDate: 'now' },
  data: dataPluginMock.createStartContract(),
  http: {} as HttpSetup,
};

describe('terms', () => {
  let state: IndexPatternPrivateState;
  const InlineOptions = termsOperation.paramEditor!;

  beforeEach(() => {
    state = {
      indexPatternRefs: [],
      indexPatterns: {},
      existingFields: {},
      currentIndexPatternId: '1',
      isFirstExistenceFetch: false,
      layers: {
        first: {
          indexPatternId: '1',
          columnOrder: ['col1', 'col2'],
          columns: {
            col1: {
              label: 'Top value of category',
              dataType: 'string',
              isBucketed: true,
              operationType: 'terms',
              params: {
                orderBy: { type: 'alphabetical' },
                size: 3,
                orderDirection: 'asc',
              },
              sourceField: 'category',
            },
            col2: {
              label: 'Count',
              dataType: 'number',
              isBucketed: false,
              sourceField: 'Records',
              operationType: 'count',
            },
          },
        },
      },
    };
  });

  describe('toEsAggsConfig', () => {
    it('should reflect params correctly', () => {
      const esAggsConfig = termsOperation.toEsAggsConfig(
        state.layers.first.columns.col1 as TermsIndexPatternColumn,
        'col1',
        {} as IndexPattern
      );
      expect(esAggsConfig).toEqual(
        expect.objectContaining({
          params: expect.objectContaining({
            orderBy: '_key',
            field: 'category',
            size: 3,
          }),
        })
      );
    });
  });

  describe('onFieldChange', () => {
    it('should change correctly to new field', () => {
      const oldColumn: TermsIndexPatternColumn = {
        operationType: 'terms',
        sourceField: 'source',
        label: 'Top values of source',
        isBucketed: true,
        dataType: 'string',
        params: {
          size: 5,
          orderBy: {
            type: 'alphabetical',
          },
          orderDirection: 'asc',
        },
      };
      const indexPattern = createMockedIndexPattern();
      const newNumberField = indexPattern.getFieldByName('bytes')!;

      const column = termsOperation.onFieldChange(oldColumn, newNumberField);
      expect(column).toHaveProperty('dataType', 'number');
      expect(column).toHaveProperty('sourceField', 'bytes');
      expect(column).toHaveProperty('params.size', 5);
      expect(column).toHaveProperty('params.orderBy.type', 'alphabetical');
      expect(column).toHaveProperty('params.orderDirection', 'asc');
      expect(column.label).toContain('bytes');
    });

    it('should remove numeric parameters when changing away from number', () => {
      const oldColumn: TermsIndexPatternColumn = {
        operationType: 'terms',
        sourceField: 'bytes',
        label: 'Top values of bytes',
        isBucketed: true,
        dataType: 'number',
        params: {
          size: 5,
          orderBy: {
            type: 'alphabetical',
          },
          orderDirection: 'asc',
          format: { id: 'number', params: { decimals: 0 } },
        },
      };
      const indexPattern = createMockedIndexPattern();
      const newStringField = indexPattern.fields.find((i) => i.name === 'source')!;

      const column = termsOperation.onFieldChange(oldColumn, newStringField);
      expect(column).toHaveProperty('dataType', 'string');
      expect(column).toHaveProperty('sourceField', 'source');
      expect(column.params.format).toBeUndefined();
    });
  });

  describe('getPossibleOperationForField', () => {
    it('should return operation with the right type', () => {
      expect(
        termsOperation.getPossibleOperationForField({
          aggregatable: true,
          searchable: true,
          name: 'test',
          displayName: 'test',
          type: 'string',
          aggregationRestrictions: {
            terms: {
              agg: 'terms',
            },
          },
        })
      ).toEqual({
        dataType: 'string',
        isBucketed: true,
        scale: 'ordinal',
      });

      expect(
        termsOperation.getPossibleOperationForField({
          aggregatable: true,
          searchable: true,
          name: 'test',
          displayName: 'test',
          type: 'number',
          aggregationRestrictions: {
            terms: {
              agg: 'terms',
            },
          },
        })
      ).toEqual({
        dataType: 'number',
        isBucketed: true,
        scale: 'ordinal',
      });

      expect(
        termsOperation.getPossibleOperationForField({
          aggregatable: true,
          searchable: true,
          name: 'test',
          displayName: 'test',
          type: 'boolean',
        })
      ).toEqual({
        dataType: 'boolean',
        isBucketed: true,
        scale: 'ordinal',
      });

      expect(
        termsOperation.getPossibleOperationForField({
          aggregatable: true,
          searchable: true,
          name: 'test',
          displayName: 'test',
          type: 'ip',
        })
      ).toEqual({
        dataType: 'ip',
        isBucketed: true,
        scale: 'ordinal',
      });
    });

    it('should not return an operation if restrictions prevent terms', () => {
      expect(
        termsOperation.getPossibleOperationForField({
          aggregatable: false,
          searchable: true,
          name: 'test',
          displayName: 'test',
          type: 'string',
        })
      ).toEqual(undefined);

      expect(
        termsOperation.getPossibleOperationForField({
          aggregatable: true,
          aggregationRestrictions: {},
          searchable: true,
          name: 'test',
          displayName: 'test',
          type: 'string',
        })
      ).toEqual(undefined);
    });
  });

  describe('buildColumn', () => {
    it('should use type from the passed field', () => {
      const termsColumn = termsOperation.buildColumn({
        indexPattern: createMockedIndexPattern(),
        field: {
          aggregatable: true,
          searchable: true,
          type: 'boolean',
          name: 'test',
          displayName: 'test',
        },
        columns: {},
      });
      expect(termsColumn.dataType).toEqual('boolean');
    });

    it('should use existing metric column as order column', () => {
      const termsColumn = termsOperation.buildColumn({
        indexPattern: createMockedIndexPattern(),
        columns: {
          col1: {
            label: 'Count',
            dataType: 'number',
            isBucketed: false,
            sourceField: 'Records',
            operationType: 'count',
          },
        },
        field: {
          aggregatable: true,
          searchable: true,
          type: 'boolean',
          name: 'test',
          displayName: 'test',
        },
      });
      expect(termsColumn.params).toEqual(
        expect.objectContaining({
          orderBy: { type: 'column', columnId: 'col1' },
        })
      );
    });

    it('should use the default size when there is an existing bucket', () => {
      const termsColumn = termsOperation.buildColumn({
        indexPattern: createMockedIndexPattern(),
        columns: state.layers.first.columns,
        field: {
          aggregatable: true,
          searchable: true,
          type: 'boolean',
          name: 'test',
          displayName: 'test',
        },
      });
      expect(termsColumn.params).toEqual(expect.objectContaining({ size: 3 }));
    });

    it('should use a size of 5 when there are no other buckets', () => {
      const termsColumn = termsOperation.buildColumn({
        indexPattern: createMockedIndexPattern(),
        columns: {},
        field: {
          aggregatable: true,
          searchable: true,
          type: 'boolean',
          name: 'test',
          displayName: 'test',
        },
      });
      expect(termsColumn.params).toEqual(expect.objectContaining({ size: 5 }));
    });
  });

  describe('onOtherColumnChanged', () => {
    it('should keep the column if order by column still exists and is metric', () => {
      const initialColumn: TermsIndexPatternColumn = {
        label: 'Top value of category',
        dataType: 'string',
        isBucketed: true,

        // Private
        operationType: 'terms',
        params: {
          orderBy: { type: 'column', columnId: 'col1' },
          size: 3,
          orderDirection: 'asc',
        },
        sourceField: 'category',
      };
      const updatedColumn = termsOperation.onOtherColumnChanged!(initialColumn, {
        col1: {
          label: 'Count',
          dataType: 'number',
          isBucketed: false,
          sourceField: 'Records',
          operationType: 'count',
        },
      });
      expect(updatedColumn).toBe(initialColumn);
    });

    it('should switch to alphabetical ordering if there are no columns to order by', () => {
      const termsColumn = termsOperation.onOtherColumnChanged!(
        {
          label: 'Top value of category',
          dataType: 'string',
          isBucketed: true,

          // Private
          operationType: 'terms',
          params: {
            orderBy: { type: 'column', columnId: 'col1' },
            size: 3,
            orderDirection: 'asc',
          },
          sourceField: 'category',
        },
        {}
      );
      expect(termsColumn.params).toEqual(
        expect.objectContaining({
          orderBy: { type: 'alphabetical' },
        })
      );
    });

    it('should switch to alphabetical ordering if the order column is not a metric anymore', () => {
      const termsColumn = termsOperation.onOtherColumnChanged!(
        {
          label: 'Top value of category',
          dataType: 'string',
          isBucketed: true,

          // Private
          operationType: 'terms',
          params: {
            orderBy: { type: 'column', columnId: 'col1' },
            size: 3,
            orderDirection: 'asc',
          },
          sourceField: 'category',
        },
        {
          col1: {
            label: 'Value of timestamp',
            dataType: 'date',
            isBucketed: true,

            // Private
            operationType: 'date_histogram',
            params: {
              interval: 'w',
            },
            sourceField: 'timestamp',
          },
        }
      );
      expect(termsColumn.params).toEqual(
        expect.objectContaining({
          orderBy: { type: 'alphabetical' },
        })
      );
    });
  });

  describe('param editor', () => {
    it('should render current order by value and options', () => {
      const setStateSpy = jest.fn();
      const instance = shallow(
        <InlineOptions
          {...defaultProps}
          state={state}
          setState={setStateSpy}
          columnId="col1"
          currentColumn={state.layers.first.columns.col1 as TermsIndexPatternColumn}
          layerId="first"
        />
      );

      const select = instance.find('[data-test-subj="indexPattern-terms-orderBy"]').find(EuiSelect);

      expect(select.prop('value')).toEqual('alphabetical');

      expect(select.prop('options')!.map(({ value }) => value)).toEqual([
        'column$$$col2',
        'alphabetical',
      ]);
    });

    it('should update state with the order by value', () => {
      const setStateSpy = jest.fn();
      const instance = shallow(
        <InlineOptions
          {...defaultProps}
          state={state}
          setState={setStateSpy}
          columnId="col1"
          currentColumn={state.layers.first.columns.col1 as TermsIndexPatternColumn}
          layerId="first"
        />
      );

      instance
        .find(EuiSelect)
        .find('[data-test-subj="indexPattern-terms-orderBy"]')
        .prop('onChange')!({
        target: {
          value: 'column$$$col2',
        },
      } as React.ChangeEvent<HTMLSelectElement>);

      expect(setStateSpy).toHaveBeenCalledWith({
        ...state,
        layers: {
          first: {
            ...state.layers.first,
            columns: {
              ...state.layers.first.columns,
              col1: {
                ...state.layers.first.columns.col1,
                params: {
                  ...(state.layers.first.columns.col1 as TermsIndexPatternColumn).params,
                  orderBy: {
                    type: 'column',
                    columnId: 'col2',
                  },
                },
              },
            },
          },
        },
      });
    });

    it('should render current order direction value and options', () => {
      const setStateSpy = jest.fn();
      const instance = shallow(
        <InlineOptions
          {...defaultProps}
          state={state}
          setState={setStateSpy}
          columnId="col1"
          layerId="first"
          currentColumn={state.layers.first.columns.col1 as TermsIndexPatternColumn}
        />
      );

      const select = instance
        .find('[data-test-subj="indexPattern-terms-orderDirection"]')
        .find(EuiSelect);

      expect(select.prop('value')).toEqual('asc');
      expect(select.prop('options')!.map(({ value }) => value)).toEqual(['asc', 'desc']);
    });

    it('should update state with the order direction value', () => {
      const setStateSpy = jest.fn();
      const instance = shallow(
        <InlineOptions
          {...defaultProps}
          state={state}
          setState={setStateSpy}
          columnId="col1"
          layerId="first"
          currentColumn={state.layers.first.columns.col1 as TermsIndexPatternColumn}
        />
      );

      instance
        .find('[data-test-subj="indexPattern-terms-orderDirection"]')
        .find(EuiSelect)
        .prop('onChange')!({
        target: {
          value: 'desc',
        },
      } as React.ChangeEvent<HTMLSelectElement>);

      expect(setStateSpy).toHaveBeenCalledWith({
        ...state,
        layers: {
          first: {
            ...state.layers.first,
            columns: {
              ...state.layers.first.columns,
              col1: {
                ...state.layers.first.columns.col1,
                params: {
                  ...(state.layers.first.columns.col1 as TermsIndexPatternColumn).params,
                  orderDirection: 'desc',
                },
              },
            },
          },
        },
      });
    });

    it('should render current size value', () => {
      const setStateSpy = jest.fn();
      const instance = mount(
        <InlineOptions
          {...defaultProps}
          state={state}
          setState={setStateSpy}
          columnId="col1"
          layerId="first"
          currentColumn={state.layers.first.columns.col1 as TermsIndexPatternColumn}
        />
      );

      expect(instance.find(EuiRange).prop('value')).toEqual('3');
    });

    it('should update state with the size value', () => {
      const setStateSpy = jest.fn();
      const instance = mount(
        <InlineOptions
          {...defaultProps}
          state={state}
          setState={setStateSpy}
          columnId="col1"
          layerId="first"
          currentColumn={state.layers.first.columns.col1 as TermsIndexPatternColumn}
        />
      );

      act(() => {
        instance.find(ValuesRangeInput).prop('onChange')!(7);
      });

      expect(setStateSpy).toHaveBeenCalledWith({
        ...state,
        layers: {
          first: {
            ...state.layers.first,
            columns: {
              ...state.layers.first.columns,
              col1: {
                ...state.layers.first.columns.col1,
                params: {
                  ...(state.layers.first.columns.col1 as TermsIndexPatternColumn).params,
                  size: 7,
                },
              },
            },
          },
        },
      });
    });
  });
});
