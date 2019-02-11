import { merge } from 'lodash-es';

import { TableCell } from '../../../modules/table';
import { TableHead } from '../../../modules/table';
import { TablePageSchemas } from '../../../modules/table';
import { TableRow } from '../../../modules/table';
import { TableSchemas } from '../../../modules/table';
import { TableSort } from '../../../modules/table';

/**
 * https://material.angular.io/components/table/overview
 */
export function TableBuild(o: any): TableSchemas {
  const d: any = o.datas;
  const t: any = o.translations;
  const m: any = o.modules;
  const types: any = m.types;
  return new TableSchemas(
    'history',
    merge({}, m.table, t.table),
    new TableRow(
      'thead',
      undefined,
      undefined, [
        new TableHead('date', types.columns.pay.date, undefined, undefined, 20, undefined),
        new TableHead('status', types.columns.status, undefined, undefined, 20, undefined),
        new TableHead('amount', types.columns.amount, undefined, undefined, 20, undefined),
        new TableHead('employer', types.columns.employer, ( o.width >= 768 ), undefined, 35, undefined),
        new TableHead(null, null, undefined, undefined, 5, undefined),
      ],
    ),
    d.items.map((i) => ({
      id: i.id,
      // tier: i.memberName,
      date: i.date,
      amount: i.netAmount,
      employer: i.employerName,
      status: types.reports.statuses[ i.status ],
    }))
      .map((i) => new TableRow(
        i.id,
        i,
        'onClickRow', [
          new TableCell('date', o.date.transform(i.date), undefined, undefined, undefined, undefined, undefined),
          new TableCell('status', i.status, undefined, undefined, undefined, undefined, undefined),
          new TableCell('amount', o.currency.transform(i.amount), undefined, undefined, undefined, undefined, undefined),
          new TableCell('employer', i.employer, ( o.width >= 768 ), undefined, undefined, undefined, undefined),
          // new TableCell('tier', i.tier, false, undefined, undefined, undefined, undefined),
          new TableCell(null, null, undefined, undefined, undefined, undefined, 'chevron-right'),
        ],
        )
      ),
    [
      new TableSort('date', 'd'),
    ],
    new TablePageSchemas(20, 1),
    o.width,
  );
}
