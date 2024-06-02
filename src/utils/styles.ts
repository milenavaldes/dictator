import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headline: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  textInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'grey',
    marginBottom: 20,
    padding: 10,
  },
  list: {
    flexGrow: 0,
    marginBottom: 20,
  },
  listItem: {
    fontSize: 16,
    padding: 10,
  },
  scrollContainer: {},
  dictatePage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Распределяет кнопки равномерно
    marginBottom: 20,
  },
});

export default styles;
