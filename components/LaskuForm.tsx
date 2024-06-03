import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { TextInput, Button, Snackbar, Dialog, Portal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { lisaaLasku } from '../store/LaskuSlice';
import KameraNakyma from './KameraNakyma';
import { RootState } from '../store/store';


const LaskuForm: React.FC = () => {
  const [maksunSaaja, setMaksunSaaja] = useState('');
  const [tilinumero, setTilinumero] = useState('');
  const [erapaiva, setErapaiva] = useState('');
  const [summa, setSumma] = useState('');
  const [viitenumero, setViitenumero] = useState('');
  const [onMaksettu, setOnMaksettu] = useState(false);
  const dispatch = useDispatch();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [viivakoodiInput, setViivakoodiInput] = useState('');
  const [viivakoodiInputError, setViivakoodiInputError] = useState(false);

  const [isDialogVisible, setIsDialogVisible] = useState(true);

  const [maksunSaajaError, setMaksunSaajaError] = useState(false);
  const [tilinumeroError, setTilinumeroError] = useState(false);
  const [erapaivaError, setErapaivaError] = useState(false);
  const [summaError, setSummaError] = useState(false);
  const [viitenumeroError, setViitenumeroError] = useState(false);

  const [naytaKamera, setNaytaKamera] = useState(false);

  const suljeKameraNakyma = () => {
    setNaytaKamera(false);
  };

  const skannattuData = useSelector((state: RootState) => state.lasku.skannattuData);


  useEffect(() => {

    if (skannattuData) {
      setTilinumero(skannattuData.tilinumero);
      setSumma(skannattuData.summa);
      setViitenumero(skannattuData.viitenumero);
      setErapaiva(skannattuData.erapaiva);
      setNaytaKamera(false);
    }
  }, [skannattuData]);

  const parseViivakoodi = (koodi: string) => {
    const tilinumero = `FI${koodi.substring(1, 17)}`;
    const summa = `${parseInt(koodi.substring(17, 23), 10)}.${koodi.substring(23, 25)}`;
    let viitenumero = `${parseInt(koodi.substring(25, 48), 10)}`;
    let erapaiva = `${koodi.substring(52, 54)}.${koodi.substring(50, 52)}.${"20" + koodi.substring(48, 50)}`;


    setTilinumero(tilinumero);
    setSumma(summa);
    setViitenumero(viitenumero);
    setErapaiva(erapaiva);

    setIsDialogVisible(false);
  };

  const handleDialogSubmit = () => {
    if (/^\d+$/.test(viivakoodiInput)) {
      parseViivakoodi(viivakoodiInput);
      setViivakoodiInputError(false);
      setViivakoodiInput('');
    } else {
      setViivakoodiInputError(true);
    }
  };

  const clearFields = () => {
    setMaksunSaaja('');
    setTilinumero('');
    setErapaiva('');
    setSumma('');
    setViitenumero('');
    setOnMaksettu(false);
  };

  const handleSubmit = () => {
    let hasError = false;


    if (!maksunSaaja) {
      setMaksunSaajaError(true);
      hasError = true;
    } else {
      setMaksunSaajaError(false);
    }
    if (!tilinumero) {
      setTilinumeroError(true);
      hasError = true;
    } else {
      setTilinumeroError(false);
    }
    if (!erapaiva) {
      setErapaivaError(true);
      hasError = true;
    } else {
      setErapaivaError(false);
    }
    if (!summa || isNaN(Number(summa))) {
      setSummaError(true);
      hasError = true;
    } else {
      setSummaError(false);
    }

    if (hasError) {
      setSnackbarMessage('Täytä kaikki kentät oikein.');
      setSnackbarVisible(true);
      return;
    }


    const uusiLasku = {
      id: Math.random(),
      maksunSaaja,
      tilinumero,
      erapaiva,
      summa: Number(summa),
      viitenumero,
      onMaksettu,
    };

    dispatch(lisaaLasku(uusiLasku));


    clearFields();


    setSnackbarMessage('Lasku tallennettu');
    setSnackbarVisible(true);
  };

  const avaaSkanneri = () => {
    setNaytaKamera(true);
  };



  if (naytaKamera) {

    return <KameraNakyma onClose={suljeKameraNakyma} />;
  }

  return (
    <View style={styles.container}>
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>Virtuaaliviivakoodi</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Syötä virtuaaliviivakoodi"
              mode="outlined"
              value={viivakoodiInput}
              onChangeText={text => {
                setViivakoodiInput(text);
                if (viivakoodiInputError) {
                  setViivakoodiInputError(false);
                }
              }}
              keyboardType="numeric"
              error={viivakoodiInputError}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>peruuta</Button>
            <Button onPress={() => {
              handleDialogSubmit();
              setIsDialogVisible(false);
            }}>Pura koodi</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Button
        mode="contained"
        onPress={() => setIsDialogVisible(true)}
        style={styles.dialogButton}
      >
        Syötä virtuaaliviivakoodi
      </Button>
      <TextInput
        label="Maksun saaja"
        value={maksunSaaja}
        onChangeText={(text) => {
          setMaksunSaaja(text);
          if (text) setMaksunSaajaError(false);
        }}
        mode="outlined"
        style={styles.input}
        error={maksunSaajaError}
      />

      <TextInput
        label="Tilinumero"
        value={tilinumero}
        onChangeText={(text) => {
          setTilinumero(text);
          if (text) setTilinumeroError(false);
        }}
        mode="outlined"
        style={styles.input}
        error={tilinumeroError}
      />

      <TextInput
        label="Eräpäivä"
        value={erapaiva}
        onChangeText={(text) => {
          setErapaiva(text);
          if (text) setErapaivaError(false);
        }}
        mode="outlined"
        style={styles.input}
        error={erapaivaError}
      />

      <TextInput
        label="Summa"
        value={summa}
        onChangeText={(text) => {
          setSumma(text);
          if (text && !isNaN(Number(text))) setSummaError(false);
          else setSummaError(true);
        }}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        error={summaError}
      />

      <TextInput
        label="Viitenumero"
        value={viitenumero}
        onChangeText={(text) => {
          setViitenumero(text);
          if (text) setViitenumeroError(false);
        }}
        mode="outlined"
        style={styles.input}
        error={viitenumeroError}
      />
      <View style={styles.switchContainer}>
        <Switch value={onMaksettu} onValueChange={setOnMaksettu} />
        <TextInput
          label="On maksettu"
          mode="outlined"
          disabled
          style={{ flex: 1, marginLeft: 10 }}
        />
      </View>
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Lisää Lasku
      </Button>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ marginBottom: 150, zIndex: 10 }}

      >
        {snackbarMessage}
      </Snackbar>
      <Button
        mode="outlined"
        onPress={clearFields}
        style={styles.clearButton}

      >
        Tyhjennä kentät
      </Button>
      <Button
        mode="contained"
        onPress={avaaSkanneri}
        style={styles.dialogButton}
      >
        Avaa viivakoodilukija (Beta)
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
  },
  dialogButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: '#f5f5f5',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
});

export default LaskuForm;
