import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headline: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
    height: 400,
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
  scrollContainer: {
    flexGrow: 1,
  },
  dictatePage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 10,
  },
});

export default styles;
