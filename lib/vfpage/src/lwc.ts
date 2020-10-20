import {CreateLwcInput, LwcMobile, SetChildrenOptions} from 'types';
import {strQueryToArray} from './utils';

/**
 * Creates the LWC.
 */
export const createLwc = (
  lwcConfig: CreateLwcInput,
  callback: (
    element: LwcMobile,
    status: string,
    lwcConfig: CreateLwcInput,
  ) => void,
) => {
  const {vfns, ns, component, props} = lwcConfig;
  const auraComponent = `${vfns || ns}:ltngOutVF`;

  const onLoad = () => {
    const componentName = `${ns}:${component}`;
    (window as any).$Lightning.createComponent(
      componentName,
      props,
      'lightning',
      (data: any, status: string) =>
        callback(data.elements[0], status, lwcConfig),
    );
  };

  (window as any).$Lightning.use(auraComponent, onLoad);
};

export const setProps = (props: any, elem: any) => {
  Object.keys(props).forEach((propName) => {
    elem[propName] = props[propName];
  });
};

export const setChildrenProps = (
  options: SetChildrenOptions[],
  lwcElement: LwcMobile,
) => {
  options.forEach((item) => {
    /**
     * Get the target child element.
     */
    const itemElement = strQueryToArray(item.element);

    // TODO: run querySelectorAll on the last element.
    const targetElement = itemElement.reduce(
      (currentValue: any, nextValue: string) => {
        if (currentValue.shadowRoot) {
          return currentValue.shadowRoot.querySelector(nextValue);
        }
        return currentValue.querySelector(nextValue);
      },
      lwcElement,
    );

    /**
     * Lwc child element.
     * TODO: should be an array.
     */
    if (targetElement) {
      /**
       * Apply to target element properties.
       */
      setProps(item.props, targetElement);

      /**
       * targetelement is an input element, the hack is to
       * explicitly focus on that element, and then blur it.
       * Usuful on omniscripts since it only listens on blur
       * event to update the json data.
       */
      if (targetElement.focus) {
        targetElement.focus();
        setTimeout(() => targetElement.blur(), 0);
      }
    }
  });
};

export const removeLwc = (props: any) => {
  const lwcWrapper = document.getElementById('lightning');
  if (lwcWrapper) {
    lwcWrapper.innerHTML = '';
  }
};
