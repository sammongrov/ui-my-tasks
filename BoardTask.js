import React, { Component } from 'react';
import { View, TouchableOpacity, FlatList, ScrollView, BackHandler, ListView } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from 'react-native-theme';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import { Colors } from '@ui/theme_default';
import { NavBar, Text, Screen, Icon, Avatar } from '@ui/components';
// import DBManager from '../app/DBManager';
import {DBManager} from 'app-module';

export default class BoardTask extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  static defaultProps = {};

  state = {};

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount = () => {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  };

  handleBackPress = () => {
    Actions.pop();
    return true;
  };

  fetchCardDetail = (item) => {
    if (Actions.currentScene === 'BoardTasksList') {
      Actions.CardDetails({
        cardId: item._id,
      });
    }
  };

  keyExtractor = (item) => item._id;

  renderIcon = (description) => {
    if (description !== '' && description !== null) {
      return (
        <View style={styles.cIcon}>
          <Icon name="text" type="material-community" color={Colors.ICON_CARD} size={18} />
        </View>
      );
    }
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
    const { commentCount, checklistCount } = this.props;
    const mem = item.members;
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
        <Text
          style={[
            styles.newsStatisticsText,
            { justifyContent: 'center', textAlign: 'left', color: '#000' },
          ]}
        >
          {item.title}
        </Text>
        {((commentCount || checklistCount || mem || item.description) && (
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
          <View>{this.renderListAvatar(mem)}</View>
        </View>
      </TouchableOpacity>
    );
  };

  renderBoards = () => {
    const { boardCards } = this.props;
    const renderOutput = [];
    const filterByList = _.groupBy(boardCards, 'listTitle');
    const listNames = Object.keys(filterByList);
    listNames.forEach((a) => {
      const filterList = _.filter(boardCards, { listTitle: a });
      const sortedCards = _.sortBy(filterList, 'sort');
      renderOutput.push(
        <View
          key={a}
          style={{
            marginBottom: 15,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 20,
                marginBottom: 10,
                fontWeight: '500',
                color: Colors.TEXT_BLACK,
              }}
            >
              {a}
            </Text>
          </View>
          <FlatList
            keyExtractor={this.keyExtractor}
            data={sortedCards}
            renderItem={this.renderCards}
            scrollEnabled={false}
          />
        </View>,
      );
    });
    return renderOutput;
  };

  renderMain = () => {
    const { boardCards } = this.props;
    if (boardCards.length > 0) {
      return (
        <ScrollView
          style={{ paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#FFF' }}
          containerStyle={[styles.flex1, styles.disclaimerContainer]}
        >
          {this.renderBoards()}
        </ScrollView>
      );
    }
  };

  render() {
    const { boardTitle } = this.props;
    return (
      <Screen>
        <NavBar
          titleText={boardTitle}
          leftComponent={
            <TouchableOpacity
              style={[
                styles.navSideButtonDimension,
                styles.alignJustifyCenter,
                styles.paddingRight10,
              ]}
              onPress={() => {
                if (Actions.currentScene === 'BoardTasksList') {
                  Actions.pop();
                }
              }}
            >
              <Icon
                name="chevron-left"
                type="material-community"
                color={Colors.NAV_ICON}
                size={36}
              />
            </TouchableOpacity>
          }
        />
        {this.renderMain()}
      </Screen>
    );
  }
}

BoardTask.propTypes = {
  boardTitle: PropTypes.string,
  boardCards: PropTypes.array,
  commentCount: PropTypes.number,
  checklistCount: PropTypes.number,
};

BoardTask.defaultProps = {
  boardTitle: '',
  boardCards: [],
  commentCount: null,
  checklistCount: null,
};
