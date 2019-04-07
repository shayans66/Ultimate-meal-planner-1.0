import React, {Component} from 'react';
import {
    AppRegistry,
    TextInput,
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    Image,
    Button,
    TouchableOpacity
} from 'react-native';
import {Camera, Permissions, FileSystem} from 'expo';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import camIcon from './assets/camera.png';

class CreateMeal extends Component {
    static navigationOptions = {
        title: 'Create a Meal'
    };

    constructor(props) {
        super(props);
        this.state = {items: []};
        this.props.navigation.addListener(
            'willFocus',
            () => {
                const {navigation} = this.props;
                const name = navigation.getParam('name', '');
                navigation.setParams({});

                if (name !== '')
                    this.setState({items: this.state.items.concat(name)});

            }
        );
    }

    render() {
        return (
            <SafeAreaView style={{padding: 15}}>
                <Button onPress={() => this.props.navigation.push('Add')} title={'Add Item'}/>
                {this.state.items.map((i, index) => (
                    <Text key={index}>{i}</Text>
                ))}
            </SafeAreaView>
        )
    }
}

class HomeScreen extends Component {
    static navigationOptions = {
        title: 'Home'
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <SafeAreaView>
                <Button onPress={() => this.props.navigation.push('Create')} title={'Create Meal'}/>
            </SafeAreaView>
        );
    }
}

class AddItem extends Component {
    static navigationOptions = {
        title: 'Add Item'
    };

    constructor(props) {
        super(props);
        this.state = {text: '', placeholder: 'Enter meal name', meals: []};
    }

    getMeals(name) {
        let self = this;
        fetch(`http://10.15.67.206:6154/list?food=${name}&max=10`)
            .then((response) => response.json())
            .then(function (json) {
                let meals = [];
                json.list.item.map(function (o) {
                    meals.push([o.name, o.ndbno]);
                });
                self.setState({'meals': meals});
            })
            .catch((response) => console.error(response));
    }

    render() {
        let message = <Text/>;
        if (this.state.meals.length > 0) {
            message = <Text>Choose the best describing food from below</Text>
        }
        return (
            <SafeAreaView style={{flex: 1, margin: 12}}>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <View style={{flex: 1, padding: 15}}>
                        <View style={{flex: 1}}/>
                        <Text>Placeholder</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{flex: 1}}>
                            <TextInput
                                style={{
                                    borderRadius: 4,
                                    borderWidth: 0.5,
                                    borderColor: '#d6d7da',
                                    marginHorizontal: 10,
                                    marginBottom: 30,
                                    padding: 8
                                }}
                                placeholder='Enter meal name'
                                label='Meal Name'
                                value={this.state.text}
                                onChangeText={(text) => this.setState({text: text})}
                                onSubmitEditing={({nativeEvent}) => this.getMeals(nativeEvent.text)}
                            />
                        </View>
                        <TouchableOpacity onPress={() => console.log(this.props.navigation.navigate('Cam'))}>
                            <Image source={camIcon} style={{width: 32, height: 32}}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flex: 3}}>
                    {message}
                    <View style={{marginVertical: 5}}/>
                    {this.state.meals.map(item => (
                        <Button key={item[1]}
                                style={{
                                    marginVertical: 1,
                                }}
                                title={item[0]}
                                onPress={() => {
                                    this.props.navigation.navigate('Create',
                                        {'name': item[0]})
                                }}
                        />
                    ))}
                </View>
            </SafeAreaView>
        );
    }
}

class CameraScreen extends Component {
    static navigationOptions = {
        title: 'Camera'
    };
    state = {
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
    };

    async componentDidMount() {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasCameraPermission: status === 'granted'});
    }

    render() {
        const {hasCameraPermission} = this.state;
        if (hasCameraPermission === null) {
            return <View/>;
        } else if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        } else {
            return (
                <View style={{flex: 1}}>
                    <Camera style={{flex: 1}} type={this.state.type} ref={ref => {
                        this.camera = ref;
                    }}>
                        <SafeAreaView
                            style={{
                                flex: 1,
                                backgroundColor: 'transparent',
                                flexDirection: 'row',
                            }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    alignSelf: 'flex-start',
                                    margins: 30
                                }}
                                onPress={() => {
                                    this.props.navigation.navigate('Main');
                                }}>
                                <Text
                                    style={{fontSize: 22, color: 'white'}}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    alignSelf: 'flex-start',
                                    alignItems: 'stretch',
                                    margins: 30
                                }}
                                onPress={() => {
                                    this.setState({
                                        type: this.state.type === Camera.Constants.Type.back
                                            ? Camera.Constants.Type.front
                                            : Camera.Constants.Type.back,
                                    });
                                }}>
                                <Text
                                    style={{textAlign: 'right', fontSize: 22, color: 'white'}}>
                                    Flip
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    alignSelf: 'flex-end',
                                    alignItems: 'stretch',
                                    margins: 30
                                }}
                                onPress={async () => {
                                    if (this.camera) {
                                        let photo = await this.camera.takePictureAsync();
                                        const formData = new FormData();
                                        formData.append('media', {
                                            name: 'img.jpg',
                                            type: photo.type,
                                            uri: photo.uri.replace("file://", "")
                                        });
                                        fetch(`http://10.15.67.206:6154/vision`, {
                                            method: 'POST',
                                            body: formData
                                        }).then((response) => response.json())
                                            .then(json =>
                                                this.props.navigation.navigate(
                                                    'ChooseFood',
                                                    {foods: json}))
                                            .catch((err) => console.error(err));
                                    }
                                }}>
                                <Text
                                    style={{fontSize: 22, color: 'white', textAlign: 'center'}}>
                                    Take
                                </Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </Camera>
                </View>
            );
        }
    }
}

class ChooseScreen extends Component {
    static navigationOptions = {
        title: 'Camera'
    };

    render() {
        const {navigation} = this.props;
        const foods = navigation.getParam('foods');

        let foodList;
        if (foods.list.length > 0)
            foodList = foods.list.map(item => (
                <Button key={item['mid']}
                        style={{
                            marginVertical: 1,
                        }}
                        title={item['description']}
                        onPress={() => {
                            this.props.navigation.navigate('Create',
                                {'name': item['description']});
                        }}
                />
            ));
        else
            foodList = <Text>No food detected. Try again taking another picture or searching instead.</Text>;

        return (
            <SafeAreaView style={{flex: 3}}>
                <View style={{marginVertical: 5}}/>
                {foodList}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const MainNavigator = createStackNavigator({
    Home: HomeScreen,
    Create: CreateMeal,
    Add: AddItem,
    ChooseFood: ChooseScreen,
});

const RootStack = createStackNavigator(
    {
        Main: {
            screen: MainNavigator,
        },
        Cam: {
            screen: CameraScreen,
        },
    },
    {
        mode: 'modal',
        headerMode: 'none',
    }
);

const AppContainer = createAppContainer(RootStack);

export default class App extends React.Component {
    render() {
        return <AppContainer/>;
    }
}
