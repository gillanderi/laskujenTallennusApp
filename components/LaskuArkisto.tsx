import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectLaskut,
  paivitaLasku,
  Lasku,
} from '../store/LaskuSlice';
import { Dialog, Portal, Button, TextInput, Switch } from 'react-native-paper';

const LaskuArkisto: React.FC = () => {
  const laskut = useSelector(selectLaskut);
  const dispatch = useDispatch();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editedLasku, setEditedLasku] = useState<Lasku | null>(null);


  const openDialog = (lasku: Lasku) => {
    setEditedLasku(lasku);
    setDialogVisible(true);
  };


  const handleSave = () => {
    if (editedLasku) {
      dispatch(paivitaLasku(editedLasku));
      setDialogVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={laskut}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.laskuContainer} onPress={() => openDialog(item)}>
            <Text>{item.maksunSaaja}</Text>
            <Text>Eräpäivä: {item.erapaiva}</Text>
            <Text>Summa: {item.summa}€</Text>
            <Text>Maksettu: {item.onMaksettu ? 'Kyllä' : 'Ei'}</Text>
          </TouchableOpacity>
        )}
      />
      <Portal>
        <LaskuMuokkausDialog />
      </Portal>
    </View>
  );

  function LaskuMuokkausDialog() {
    return (
      <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
        <Dialog.Title>Laskun Tiedot</Dialog.Title>
        <Dialog.Content>
          {editedLasku && (
            <>
              <TextInput
                label="Maksun saaja"
                value={editedLasku.maksunSaaja}
                onChangeText={(text) => setEditedLasku({ ...editedLasku, maksunSaaja: text })}
              />
              <TextInput
                label="Tilinumero"
                value={editedLasku.tilinumero}
                onChangeText={(text) => setEditedLasku({ ...editedLasku, tilinumero: text })}
              />
              <TextInput
                label="Viitenumero"
                value={editedLasku.viitenumero}
                onChangeText={(text) => setEditedLasku({ ...editedLasku, viitenumero: text })}
              />
              <TextInput
                label="Eräpäivä"
                value={editedLasku.erapaiva}
                onChangeText={(text) => setEditedLasku({ ...editedLasku, erapaiva: text })}
              />
              <TextInput
                label="Summa"
                value={editedLasku.summa.toString()}
                keyboardType="numeric"
                onChangeText={(text) => setEditedLasku({ ...editedLasku, summa: parseFloat(text) })}
              />
              <View >
                <Text>Maksettu:</Text>
                <Switch
                  value={editedLasku.onMaksettu}
                  onValueChange={(value) => setEditedLasku({ ...editedLasku, onMaksettu: value })}
                />
              </View>
            </>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogVisible(false)}>Peruuta</Button>
          <Button onPress={handleSave}>Tallenna</Button>
        </Dialog.Actions>
      </Dialog>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  laskuContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
});

export default LaskuArkisto;