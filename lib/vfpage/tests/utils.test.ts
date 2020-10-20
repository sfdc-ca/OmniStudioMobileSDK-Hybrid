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

test('generateId will be called recursively', () => {
  const spy = jest.spyOn(utils, 'generateId');
  const callbacks: any = {
    get: jest.fn().mockReturnValueOnce(true).mockReturnValue(false),
  };
  utils.generateId(callbacks);
  expect(spy).toBeCalledTimes(2);
});

test('promiseHandler on resolve', async () => {
  const promiseContainer: any = {
    action: null,
  };
  const res = jest.fn();
  new Promise((resolve, reject) => {
    promiseContainer.action = utils.promiseHandler(res, reject);
  });
  promiseContainer.action(1, null);
  expect(res).toBeCalledWith(1);
});

test('promiseHandler on reject', async () => {
  const promiseContainer: any = {
    action: null,
  };
  const res = jest.fn();
  new Promise((resolve, reject) => {
    promiseContainer.action = utils.promiseHandler(resolve, res);
  });
  promiseContainer.action(null, 'error');
  expect(res).toBeCalledWith('error');
});
