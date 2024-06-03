import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { Dialog, Portal, TextInput, Button, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { lisaaLasku, setSkannattuData } from '../store/LaskuSlice';

const KameraNakyma: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const [scanned, setScanned] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [betaAlertVisible, setBetaAlertVisible] = useState(true);
  const [laskunTiedot, setLaskunTiedot] = useState({
    tilinumero: '',
    summa: '',
    viitenumero: '',
    erapaiva: '',
    maksunSaaja: '',
  });

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    setBetaAlertVisible(true);
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
    setScanned(true);
    console.log("Skannattu data:", data);

    try {
      const version = data.substring(0, 1);
      let tilinumero = `FI${data.substring(1, 17)}`;
      let summa = `${parseInt(data.substring(17, 23), 10)}.${data.substring(23, 25)}`;
      let erapaivaIndex = data.length - 6;
      let viitenumero = data.substring(25, erapaivaIndex);

      viitenumero = `${BigInt(viitenumero)}`;
      let erapaiva = `${data.substring(erapaivaIndex, erapaivaIndex + 2)}.${data.substring(erapaivaIndex + 2, erapaivaIndex + 4)}.${"20" + data.substring(erapaivaIndex + 4, erapaivaIndex + 6)}`;
      if (version === "4" || version === "5") {

        dispatch(setSkannattuData({
          tilinumero,
          summa,
          viitenumero,
          erapaiva,
        }));
        setDialogVisible(false);
      } else {
        throw new Error("Koodi ei ole odotetussa muodossa.");
      }
    } catch (error) {
      Alert.alert("Virhe", "Koodi ei oikeassa muodossa, lue uudelleen.");
      setScanned(false);
    }
  };

  const tallennaLasku = () => {
    const summaNumero = Number(laskunTiedot.summa);
    if (!isNaN(summaNumero)) {

      dispatch(setSkannattuData({
        tilinumero: laskunTiedot.tilinumero,
        summa: laskunTiedot.summa,
        viitenumero: laskunTiedot.viitenumero,
        erapaiva: laskunTiedot.erapaiva,

      }));

      setDialogVisible(false);
      setScanned(false);

    } else {
      Alert.alert("Virhe", "Summan pitää olla numero.");
    }
  };

  if (hasPermission === null) {
    return <View><Button onPress={() => { }} mode="text">Pyydetään kameraoikeuksia</Button></View>;
  }

  if (hasPermission === false) {
    return <View><Button onPress={() => { }} mode="text">Ei pääsyä kameraan</Button></View>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.scannerIndicator} />
      </Camera>
      <Portal>
        <Dialog visible={betaAlertVisible} onDismiss={() => setBetaAlertVisible(false)}>
          <Dialog.Title>Beta-versio varoitus</Dialog.Title>
          <Dialog.Content>
            <Text>
              Huomioithan, että viivakoodilukija on Beta-versiossa ja ei aina toimi täydellisesti.
              Skanneri toimii huonommin virtuaalisilta näytöiltä luettessa.
            </Text>
            <Text style={{ fontWeight: 'bold' }}>
              Tarkistathan kunnolla luetut laskun tiedot.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setBetaAlertVisible(false)}>Hyväksy</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Tarkasta ja täydennä laskun tiedot</Dialog.Title>
          <Dialog.Content>

            <TextInput
              label="Maksun saaja"
              value={laskunTiedot.maksunSaaja}
              onChangeText={text => setLaskunTiedot({ ...laskunTiedot, maksunSaaja: text })}
              mode="outlined"
            />
            <TextInput
              label="Tilinumero"
              value={laskunTiedot.tilinumero}
              onChangeText={text => setLaskunTiedot({ ...laskunTiedot, tilinumero: text })}
              mode="outlined"

            />
            <TextInput
              label="Summa"
              value={laskunTiedot.summa}
              onChangeText={text => setLaskunTiedot({ ...laskunTiedot, summa: text })}
              mode="outlined"
              keyboardType="numeric"
            />
            <TextInput
              label="Viitenumero"
              value={laskunTiedot.viitenumero}
              onChangeText={text => setLaskunTiedot({ ...laskunTiedot, viitenumero: text })}
              mode="outlined"
            />
            <TextInput
              label="Eräpäivä"
              value={laskunTiedot.erapaiva}
              onChangeText={text => setLaskunTiedot({ ...laskunTiedot, erapaiva: text })}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} mode="text">Peruuta</Button>
            <Button onPress={tallennaLasku} mode="contained">Tallenna</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerIndicator: {
    width: 250,
    height: 70,
    borderWidth: 2,
    borderColor: 'green',
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default KameraNakyma;