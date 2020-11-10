import React, {useRef} from 'react';
import {Dimensions, StyleSheet, SafeAreaView, ScrollView} from 'react-native';

/**
 * Imports from the sdk.
 */
import {Lwc, useSf} from 'mobile-hybrid-sdk/react';
import graphConfig from './graphConfig';

const components = {
  relGraph: 'graph',
  card: 'cfCardPlayground',
  dc: 'dcSampleApp',
};

const CardPlayground = () => {
  /**
   * React's way of getting the reference to the component.
   */
  const el = useRef();

  /**
   * Get the "user" data from the sdk's useSf hook.
   */
  const {
    sf: {user},
  } = useSf();

  /**
   * Listens to the "loaded" event from the LWC.
   */
  const onLwcLoad = () => {
    /**
     * Set the props/attribute of the card's lwc layout.
     *
     * "c-card-playground" is the attached layout of the card.
     */
    el.current.setElementProps('c-card-playground', {user});
  };

  /**
   * Collection of functions that the LWC can call.
   *
   * Customer can add all the business logic
   * functions here.
   */
  const methods = {
    /**
     * Appends the input data from lwc to the "Native Response:" string.
     */
    generateData: (dataFromLwc) => `Native Response: ${dataFromLwc}`,
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Lwc
          componentName={components.card}
          lwcAttrs={{user}}
          onLwcLoad={onLwcLoad}
          methods={methods}
          style={styles.lwc}
          ref={el}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Style related block.
 */
const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  lwc: {
    width,
    height: height - 167,
  },
});

export default CardPlayground;
