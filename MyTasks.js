import React, { Component } from 'react';
import { View, TouchableOpacity, FlatList, ScrollView, Modal, Alert, ListView } from 'react-native';
import { styles } from 'react-native-theme';
import { iOSColors } from 'react-native-typography';
import { Actions } from 'react-native-router-flux';
import { NavBar, Text, Screen, Icon, Avatar, EvilIcon, Ionicon } from '@ui/components';
import { Colors } from '@ui/theme_default';
import _ from 'lodash';
// import DBManager from '../app/DBManager';
import {DBManager} from 'app-module';

export default class MyTasks extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
  }

  state = {
    dataSource: [],
    boardsOfCards: [],
    categoryList: [],
    modalVisible: false,
    listWithFilter: [],
    filter: false,
    selectedListName: '',

    // dummy data for icon
    commentCount: null,
    checklistCount: null,
  };

  componentWillMount = () => {
    if (DBManager && DBManager.app && DBManager.app.userId) {
      DBManager.board.fetchUserTasks(DBManager.app.userId);
    }
  };

  componentDidMount = () => {
    this._isMounted = true;
    DBManager.card.addCardListener(this.updateBoardList);
  };

  componentWillUnmount = () => {
    this._isMounted = false;
    DBManager.card.removeCardListener(this.updateBoardList);
  };

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  updateBoardList = () => {
    if (!this._isMounted) return;
    const { list } = DBManager.card;
    const cardArray = Object.keys(list).map((c) => list[c]);
    const boardsOfCards = [];
    const cardWithDetails = [];
    const listOfCards = [];
    const boardDetailsArray = [];
    const listDetailsArray = [];
    cardArray.forEach((el) => {
      cardWithDetails.push({
        ...el,
        boardTitle: DBManager.board.findById(el.boardId).title,
        listTitle: DBManager.lists.findById(el.listId).title,
      });
    });
    cardArray.forEach((el) => {
      if (!boardsOfCards.includes(el.boardId)) boardsOfCards.push(el.boardId);
      if (!listOfCards.includes(el.listId)) listOfCards.push(el.listId);
    });
    boardsOfCards.forEach((el) => {
      boardDetailsArray.push(DBManager.board.findById(el));
    });
    listOfCards.forEach((el) => {
      listDetailsArray.push(DBManager.lists.findById(el));
    });

    const filterByList = _.groupBy(cardWithDetails, 'listTitle');
    const listNames = Object.keys(filterByList);
    this.setState({
      dataSource: cardWithDetails,
      boardsOfCards: boardDetailsArray,
      categoryList: listNames,
    });
  };

  fetchUserTasks = () => {
    if (DBManager && DBManager.app && DBManager.app.userId) {
      DBManager.board.fetchUserTasks(DBManager.app.userId);
    }
  };

  fetchCardDetail = (item) => {
    if (Actions.currentScene === 'MyTasksList') {
      Actions.CardDetails({
        cardId: item._id,
        boardId: item.boardId,
        boardName: item.boardTitle,
      });
    }
  };

  keyExtractor = (item) => item._id;

  filteredList = (listName) => {
    const { dataSource } = this.state;
    const filterList = _.filter(dataSource, { listTitle: listName });
    this.setState({
      listWithFilter: filterList,
      selectedListName: listName,
    });
  };

  renderIcon = (description) => {
    if (description !== '' && description !== null) {
      return (
        <View style={styles.cIcon}>
          <Icon name="text" type="material-community" color={Colors.ICON_CARD} size={18} />
        </View>
      );
    }
  };

  renderFilterByList = () => {
    const { modalVisible, categoryList, selectedListName } = this.state;
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <View
            style={{
              height: 300,
              width: 300,
              backgroundColor: '#FFF',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
                backgroundColor: '#F5F5F5',
              }}
            >
              <Text
                style={{
                  color: '#000',
                  fontSize: 20,
                }}
              >
                Filter by list
              </Text>
            </View>
            <FlatList
              keyExtractor={(index) => index.toString()}
              data={categoryList}
              renderItem={(listItem) => (
                <TouchableOpacity
                  style={{
                    height: 40,
                    backgroundColor: '#FFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                  }}
                  key={listItem.index}
                  onPress={() => {
                    this.filteredList(listItem.item);
                    this.setModalVisible(!modalVisible);
                    this.setState({
                      filter: true,
                    });
                  }}
                >
                  <Text
                    style={{
                      color: selectedListName === listItem.item ? '#2E88FF' : iOSColors.gray,
                      fontSize: 18,
                      paddingHorizontal: 20,
                    }}
                    numberOfLines={1}
                  >
                    {listItem.item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
                borderTopWidth: 1,
                borderTopColor: '#dddddd',
              }}
              onPress={() => {
                this.setModalVisible(!modalVisible);
              }}
            >
              <Text
                style={{
                  color: '#FF5D5D',
                  fontSize: 20,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  renderMembers(member) {
    if (member) {
      const memberObj = DBManager.user.findById(member);
      if (memberObj) {
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <Avatar avatarUrl={memberObj.avatarURL} avatarName={memberObj.name} avatarSize={22} />
            <View style={{ width: 5 }} />
          </View>
        );
      }
    }
  }

  renderRowAvatar = (rowData) => {
    const member = rowData;
    return <View>{this.renderMembers(member)}</View>;
  };

  renderListAvatar(mem) {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    if (mem !== '' && mem !== null && mem !== '[]') {
      const member = JSON.parse(mem);
      const members = dataSource.cloneWithRows(member);
      return (
        <ListView
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          renderRow={this.renderRowAvatar}
          dataSource={members}
          enableEmptySections={true}
          keyboardShouldPersistTaps="always"
        />
      );
    }
  }

  renderCards = ({ item }) => {
    const { commentCount, checklistCount } = this.state;
    // const mem = item.members;
    return (
      <TouchableOpacity
        onPress={() => this.fetchCardDetail(item)}
        style={[
          styles.paddingHorizontal10,
          {
            backgroundColor: '#EEF5FF',
            borderRadius: 5,
            marginBottom: 10,
            padding: 10,
            flexDirection: 'column',
            justifyContent: 'center',
          },
        ]}
      >
        {/* <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          > */}

        <Text
          style={[
            styles.newsStatisticsText,
            { justifyContent: 'center', textAlign: 'left', color: '#000' },
          ]}
        >
          {item.title}
        </Text>
        {/* <Text numberOfLines={2} style={styles.cListTitle}>
                          {"\n"}
                  </Text> */}
        {((commentCount || checklistCount || item.description || item.listTitle) && (
          <View style={{ borderBottomWidth: 1, borderColor: '#D9E9FF', marginVertical: 8 }} />
        )) ||
          null}
        <View style={[styles.cMainIcon, { justifyContent: 'space-between' }]}>
          <View style={[styles.cMainIcon, { marginTop: 5 }]}>
            {commentCount && (
              <View style={styles.cIcon}>
                <Icon
                  name="comment-text-outline"
                  type="material-community"
                  color={Colors.ICON_CARD}
                  size={18}
                />
                <Text style={styles.cText}>{commentCount}</Text>
              </View>
            )}
            {this.renderIcon(item.description)}
            {checklistCount && (
              <View style={styles.cIcon}>
                <Icon
                  name="checkbox-marked-outline"
                  type="material-community"
                  color={Colors.ICON_CARD}
                  size={18}
                />
                <Text style={styles.cText}>{checklistCount}</Text>
              </View>
            )}
          </View>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            // style = { [ {alignSelf: 'flex-end'} ]}
            style={[styles.cListLastMessage, { marginLeft: 5 }]}
          >
            {item.listTitle}
          </Text>
          {/* <View>{this.renderListAvatar(mem)}</View> */}
        </View>
        {/* 
            <View style={{ flexDirection: 'column', flex: 1, marginRight: 5 }}>
            <Text numberOfLines={2} style={styles.cListTitle}>
                {item.title}
        </Text>
            </View>
           
        </View>
       */}
        {/* <View
            style={{
              flexDirection: 'row',
              // height: 40,
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ flexDirection: 'column', flex: 1, marginRight: 5 }}>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={[styles.flex1, styles.cListLastMessage]}
              >
                {item.listTitle}
              </Text>
            </View>
          </View> */}
        {/* <Icon
          type="material-community"
          color={Colors.NAV_ICON}
          size={48}
        /> */}
      </TouchableOpacity>
    );
  };

  renderBoards = () => {
    const { boardsOfCards, dataSource, commentCount, checklistCount } = this.state;
    const renderOutput = [];
    if (boardsOfCards.length > 0) {
      boardsOfCards.forEach((b) => {
        const cardsInBoard = dataSource.filter((card) => card.boardId === b._id);
        const sortedList = _.sortBy(cardsInBoard, 'listSort');
        renderOutput.push(
          <View key={b._id}>
            <TouchableOpacity
              onPress={() => {
                if (Actions.currentScene === 'MyTasksList') {
                  Actions.BoardTasksList({
                    boardTitle: b.title,
                    boardCards: sortedList,
                    commentCount,
                    checklistCount,
                  });
                }
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '500',
                  color: Colors.TEXT_BLACK,
                }}
              >
                {b.title}
              </Text>
              <Ionicon
                name="ios-arrow-round-forward"
                type="material-community"
                color="#bcbcbf"
                size={38}
              />
            </TouchableOpacity>
            <FlatList
              keyExtractor={this.keyExtractor}
              data={sortedList}
              renderItem={this.renderCards}
              scrollEnabled={false}
            />
          </View>,
        );
      });
      return renderOutput;
    }
  };

  renderMain = () => {
    const { boardsOfCards, filter, dataSource } = this.state;
    const userBoard = dataSource.find((card) => card.userId === DBManager.app.userId) !== undefined;
    if (boardsOfCards.length > 0 && userBoard) {
      return (
        <ScrollView
          style={{ paddingHorizontal: 15, backgroundColor: '#FFF', paddingBottom: 30 }}
          containerStyle={[styles.flex1, styles.disclaimerContainer]}
        >
          {!filter ? this.renderBoards() : this.renderFilterList()}
        </ScrollView>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.heading}>No cards yet...</Text>
      </View>
    );
  };

  renderFilterList = () => {
    const { boardsOfCards, listWithFilter } = this.state;
    if (boardsOfCards.length > 0) {
      return (
        <ScrollView
          style={{ padding: 15 }}
          containerStyle={[styles.flex1, styles.disclaimerContainer]}
        >
          <FlatList
            keyExtractor={this.keyExtractor}
            data={listWithFilter}
            renderItem={this.renderCards}
            scrollEnabled={false}
          />
        </ScrollView>
      );
    }
  };

  render() {
    return (
      <Screen>
        <NavBar
          titleText="My Tasks"
          titleContainer={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          rightComponent={
            <View style={[styles.rowDirection, styles.paddingRight10]}>
              <TouchableOpacity
                style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
                onPress={this.fetchUserTasks}
              >
                <EvilIcon
                  name="refresh"
                  type="material-community"
                  color={Colors.NAV_ICON}
                  size={38}
                />
              </TouchableOpacity>
              {/* <TouchableOpacity style={{ marginRight: 15 }} onPress={() => {
              this.setModalVisible(true);
            }}>
            <Icon name="filter-outline" type="material-community" color={Colors.NAV_ICON} size={30} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginRight: 15 }} onPress={() => {
              this.setState({ filter: false })
            }}>
            <Icon name="filter-remove-outline" type="material-community" color={Colors.NAV_ICON} size={30} />
          </TouchableOpacity> */}
            </View>
          }
        />
        {this.renderMain()}
        {this.renderFilterByList()}
      </Screen>
    );
  }
}
