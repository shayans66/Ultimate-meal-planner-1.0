import React, {Component} from 'react';
import {AppRegistry, TextInput, StyleSheet, Text, View, SafeAreaView, Image} from 'react-native';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {text: '', placeholder: 'Enter meal name', meals: []};
    }

    getMeals(name) {
        let self = this;
        fetch(`http://10.15.67.206:6154/list?q=${name}&max=10`)
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
        return (
            <SafeAreaView style={{flex: 1, margin: 12 }}>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <View style={{flex: 1, padding: 15}}>
                        <View style={{flex: 1}} />
                        <Text>Placeholder</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <TextInput
                            style={{
                                flex: 1,
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
                </View>
                <View style={{flex: 3}}>
                    {this.state.meals.map(item => (
                        <Text key={item[1]} style={{
                            padding: 5,
                            marginVertical: 7
                        }}>{item[0]}</Text>
                    ))}
                </View>
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
