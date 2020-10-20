import * as utils from '../src/utils';

test('lwcConfigFromUrl', () => {
  const jsonData = {
    ns: 'vlocity_ins',
    vfns: 'vfns',
    component: 'lwc',
    props: {
      backgroundColor: '#333',
    },
    refs: ['c-input'],
    methods: ['getData'],
  };
  const data = window.btoa(JSON.stringify(jsonData));
  const config = utils.lwcConfigFromUrl(`?data=${encodeURIComponent(data)}`);

  expect(config).toEqual(jsonData);
});
