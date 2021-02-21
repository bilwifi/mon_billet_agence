import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert,
  Modal,
  TouchableHighlight,
  ActivityIndicator,
  Image,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    axios
      .get(
        'https://api-mon-billet-agence.herokuapp.com/api/reservations/' + data
      )
      .then((res) => {
        setReservation(res.data);
        setModalVisible(true);
      })
      .catch((e) => {
        setModalVisible(true);
      });
  };

  if (hasPermission === null) {
    return (
      <Text style={styles.container}>Demmande de la permission du camera</Text>
    );
  }
  if (hasPermission === false) {
    return (
      <Text style={styles.container}>
        L'application n'a pas accès au camera
      </Text>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Image
          style={{ ImageResizeMode: 'center' }}
          source={require('./assets/logomonbillet.png')}
        />
        {!modalVisible ? (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View />
        )}

        {scanned ? (
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="blue" />
          </View>
        ) : (
          <View />
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Image
              style={{ ImageResizeMode: "center", width: 75, height: 75, marginBottom:30}}
              source={require('./assets/logomonbillet.png')}
            />
            {reservation ? (
              <View>
                <Text style={styles.modalText}>
                  Agence : {reservation.agence.nom}
                </Text>
                <Text style={styles.modalText}>
                  Bus n°: {reservation.numBus}
                </Text>
                <Text style={styles.modalText}>
                  Reservation n° {reservation.idreservation}
                </Text>

                <Text style={styles.modalText}>Nom : {reservation.nom}</Text>
                <Text style={styles.modalText}>
                  Prenom : {reservation.prenom}
                </Text>
                <Text style={styles.modalText}>
                  Etinaire : {reservation.etineraire.depart} {' - '}
                  {reservation.etineraire.arrive}
                </Text>
                <Text style={styles.modalText}>
                  Montant : {reservation.prix} FC
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{ ...styles.modalText, color: 'red', fontSize: 24 }}>
                  Billet Invalide
                </Text>
              </View>
            )}

            <TouchableHighlight
              style={{
                ...styles.openButton,
                backgroundColor: '#2196F3',
                alignItems: 'center',
              }}
              onPress={() => {
                setScanned(false);
                setModalVisible(!modalVisible);
                setReservation(null);
              }}>
              <Text style={styles.textStyle}>
                {reservation ? 'Valider' : 'Fermer'}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  barCodeView: {
    width: '100%',
    height: '50%',
    marginBottom: 40,
  },

  //Modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
  },
});
