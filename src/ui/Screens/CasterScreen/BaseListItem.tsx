import {Pressable, Text, TouchableWithoutFeedback, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CountryFlag from 'react-native-country-flag';
import {getDistance} from 'geolib';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import React from 'react';
import {observer} from 'mobx-react-lite';
import {useStoreContext} from '../../../fc/Store';
import Base from '../../../fc/Caster/Base';
import {styles} from './CasterScreen';

const limitCityName = (name: string) => {
  if (name.length < 20) {
    return name;
  }
  return name.substring(0, 20) + '...';
};
export interface ItemProp {
  item: Base;
  showBaseInfo: (Base) => void;
  latitude: number;
  longitude: number;
}

export default observer(function BaseListItem({
  item,
  showBaseInfo,
  latitude,
  longitude,
}: ItemProp) {
  const store = useStoreContext();
  const itemOnConnect = (itemConnect: Base) => () => {
    store.casterConnection.configureConnection(itemConnect);
  };

  return (
    <Pressable
      delayLongPress={300}
      onLongPress={() => showBaseInfo(item)}
      onPress={itemOnConnect(item)}>
      <View style={styles.item}>
        <View style={{flexDirection: 'column'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {item.country == null ? (
              <MaterialCommunityIcons
                name="map-marker-question-outline"
                color={'white'}
                size={30}
              />
            ) : (
              <CountryFlag isoCode={item.country} size={21} />
            )}
            <Text style={styles.title}>{'  ' + item.mountpoint}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{fontStyle: 'italic', fontSize: 15, color: 'lightgrey'}}>
              {limitCityName(item.identifier)}
            </Text>
            <Text
              style={{
                fontStyle: 'italic',
                fontSize: 15,
                color: 'darksalmon',
              }}>
              {' '}
              {Math.floor(
                getDistance(
                  {latitude: item.latitude, longitude: item.longitude},
                  {latitude: latitude, longitude: longitude},
                ) / 1000,
              )}{' '}
              km
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View>
            <Pressable
              onPress={() => {
                showBaseInfo(item);
              }}>
              <MaterialIcons name="more-horiz" color={'white'} size={40} />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
});
