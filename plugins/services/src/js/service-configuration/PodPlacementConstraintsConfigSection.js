import React from 'react';
import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';

import Section from '../../../../../src/js/components/ConfigurationMapSection';
import ConfigurationMapTable from '../components/ConfigurationMapTable.js';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';

module.exports = ({appConfig}) => {
  let constraints = findNestedPropertyInObject(appConfig,
      'scheduling.placement.constraints');

  // Since we are stateless component we will need to return something for react
  // so we are using the `<noscript>` tag as placeholder.
  if (!constraints || !constraints.length) {
    return <noscript />;
  }

  return (
    <div>
      <Heading level={3}>Placement Constraints</Heading>
      <Section>

        <ConfigurationMapTable
          className="table table-simple table-break-word flush-bottom"
          columns={[
            {
              heading: 'Label',
              prop: 'fieldName'
            },
            {
              heading: 'Operator',
              prop: 'operator'
            },
            {
              heading: 'Value',
              prop: 'value',
              hideIfempty: true
            }
          ]}
          columnDefaults={{
            hideIfempty: true,
            placeholder: <span>&mdash;</span>
          }}
          data={constraints}
          />

      </Section>
    </div>
  );
};
