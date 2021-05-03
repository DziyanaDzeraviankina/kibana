/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { EuiCode, EuiTitle } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { AggRow } from './agg_row';
import { Metric } from '../../../../common/types';
import { DragHandleProps } from '../../../types';

interface TemporaryUnsupportedAggProps {
  disableDelete: boolean;
  model: Metric;
  siblings: Metric[];
  dragHandleProps: DragHandleProps;
  onAdd: () => void;
  onDelete: () => void;
}

export function TemporaryUnsupportedAgg(props: TemporaryUnsupportedAggProps) {
  return (
    <AggRow
      disableDelete={props.disableDelete}
      model={props.model}
      onAdd={props.onAdd}
      onDelete={props.onDelete}
      siblings={props.siblings}
      dragHandleProps={props.dragHandleProps}
    >
      <EuiTitle className="tvbAggRow__unavailable" size="xxxs">
        <span>
          <FormattedMessage
            id="visTypeTimeseries.unsupportedAgg.aggIsTemporaryUnsupportedDescription"
            defaultMessage="The {modelType} aggregation is currently unsupported."
            values={{ modelType: <EuiCode>{props.model.type}</EuiCode> }}
          />
        </span>
      </EuiTitle>
    </AggRow>
  );
}
