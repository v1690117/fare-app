import {ActivityIndicator, Alert, Button, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {CameraCapturedPicture, CameraType, CameraView, useCameraPermissions} from 'expo-camera';
import {useRef, useState} from "react";


export default function HomeScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const imageContainer = useRef<CameraView>(null);
    const [picture, setPicture] = useState<CameraCapturedPicture | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [facesCount, setFacesCount] = useState(0);
    const [foundCount, setFoundCount] = useState(0);

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const takePicture = async () => {
        if (imageContainer.current) {
            try {
                const photo = await imageContainer.current.takePictureAsync({
                    quality: 1,
                });
                setPicture(photo);

                if (!photo) {
                    return;
                }
                const body = new FormData();
                body.append('file', {
                    uri: photo.uri,
                    name: 'photo.png',
                    filename: 'imageName.png',
                    type: 'image/png'
                });
                body.append('Content-Type', 'image/png');
                setIsLoading(true);
                const faces: any[] = await fetch('http://77.223.99.68:8080/recognize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    body
                }).then(r => r.json());
                console.log(faces);
                setFacesCount(faces.length);
                setFoundCount(faces.filter(f => f >= 0.5).length);

            } catch (e: any) {
                Alert.alert('Возникла ошибка', e?.message);
                setPicture(undefined);
                setFacesCount(0);
                setFoundCount(0);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const onClearHandler = () => {
        setFacesCount(0);
        setFoundCount(0);
        setPicture(undefined);
    }


    if (!permission) {
        return <View style={styles.container}>
            <Text style={styles.text}>Требуется разрешение на камеру!</Text>
        </View>
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Требуется разрешение на камеру!</Text>
                <Button onPress={requestPermission} title="grant permission"/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {!picture && <CameraView style={styles.camera} facing={facing} ref={imageContainer}/>}
                {picture && (
                    <View style={styles.searchResults}>
                        <Image source={{uri: picture.uri}} style={styles.preview}/>
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#0000ff"/>
                                <Text style={styles.loadingText}>Анализируем...</Text>
                            </View>
                        ) : (
                            <Text style={styles.text}>
                                {
                                    facesCount == 1 ? `${foundCount == 1 ? 'Однозначно' : 'Возможно'} любит рис!` :
                                        facesCount == 0 ? 'Никого не нашел...' :
                                            foundCount == 0 ? 'Возможно любят рис!' : `Как минимум один любит рис!`
                                }
                            </Text>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.buttonContainer}>
                {picture ? (
                    <TouchableOpacity style={styles.button} onPress={onClearHandler}>
                        <Text style={styles.buttonText}>Проверить еще</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                            <Text style={styles.buttonText}>Переключить камеру</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={takePicture}>
                            <Text style={styles.buttonText}>Проверить</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    searchResults: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    preview: {
        width: '100%',
        height: '80%',
        resizeMode: 'contain',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
        marginTop: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    loadingText: {
        fontSize: 18,
        color: '#000',
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        backgroundColor: '#333',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    button: {
        padding: 10,
        backgroundColor: '#555',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});