import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 0,
    margin: 0,
    paddingHorizontal: 20,
    paddingVertical: '10%',
  },

  headline: {
    fontSize: 20,
    fontWeight: 'bold',
    justifyContent: 'center',
  },

  header: {
    width: "200%",
    height: "10%",
    backgroundColor: '#8fc95b',
    marginTop: 0,
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginLeft: -60,
    top: -30,
  }, 

  contentBox: {
    width: "100%",
    backgroundColor: '#ffffff',
  },

  instructionTitleInput: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: 'grey',
    marginBottom: 20,
    padding: 10,
    textAlignVertical: 'top',
  },

  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  textInput: {
    height: 200,
    borderWidth: 1,
    borderColor: 'grey',
    marginBottom: 20,
    padding: 10,
    textAlignVertical: 'top',
  },

  list: {
    flexGrow: 0,
    marginBottom: 20,
  },
  listItem: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  listItemText: {
    fontSize: 22,
  },
  textComment: {
    fontSize: 12,
    color: 'gray'
  },
  scrollContainer: {
    flexGrow: 1,
  },
  dictatePage: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },

  readyToDictateButtonContainer: {
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 50,
    paddingBottom: 50,
  },

  stepOfSteps: {
    color: 'grey',
    fontSize: 18,
  },

  creatingButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },

  listInstructionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 0,
  },

  createInstructionButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 0,
  },

  countdown: {
    fontSize: 100,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 10,
  },
});

export default styles;
