import React from 'react';
import { StyleSheet, Text, View, StatusBar, ListView } from 'react-native';
import { Container, Content, Header, Form, Input, Item, Button, Label, Icon, List, ListItem } from 'native-base';

import * as firebase from 'firebase';
import Apikeys from './src/constants/AppKeys';

const data = [];

export default class App extends React.Component {

  constructor(props){
    super(props);

    //initialize firebase
    if (!firebase.apps.length) { firebase.initializeApp(Apikeys.FirebaseConfig); }

    // data source
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    // State of app
    this.state = {
      listViewData: data,
      newTask: ""
    }
  }

  componentDidMount(){
    var that = this

    firebase.database().ref('tasks').on('child_added', function (data){
      var newData = [...that.state.listViewData]
      newData.push(data)
      that.setState({listViewData: newData})
    })
  }

  addRow(data) {
    var key = firebase.database().ref('tasks').push().key
    firebase.database().ref('tasks').child(key).set({ name: data })
  }

  async deleteRow(secId, rowId, rowMap, data) {
    await firebase.database().ref('tasks/'+data.key).set(null)

    rowMap[`${secId}${rowId}`].props.closeRow();
    var newData = [...this.state.listViewData];
    newData.splice(rowId, 1);
    this.setState({ listViewData: newData });
  }

  showInformation() {

  }

  render() {
    return (
      <Container style={styles.container}>
        <Header style={{marginTop: StatusBar.currentHeight}}>
          <Content>
            <Item>
              <Input 
                onChangeText={(newTask) => this.setState({ newTask })}
                placeholder="Add Task"
              />
              <Button onPress={() => this.addRow(this.state.newTask)}>
                <Icon name="add" />
              </Button>
            </Item>
          </Content>
        </Header>

        <Content>
            <List
              enableEmptySections
              dataSource={this.ds.cloneWithRows(this.state.listViewData)}
              renderRow={data=>
                <ListItem>
                  <Text style={{ marginLeft: 10}}>{data.val().name}</Text>
                </ListItem>  
              }
              renderLeftHiddenRow={data=> 
                <Button full onPress={() => this.addRow(data)}>
                  <Icon name="information-circle" />
                </Button>
              }
              renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                <Button full danger onPress={() => this.deleteRow(secId, rowId, rowMap, data)}>
                  <Icon name="trash" />
                </Button>

              }
              leftOpenValue={75}
              rightOpenValue={-75}
            />
          </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
