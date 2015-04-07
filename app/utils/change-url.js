import config from '../config/environment';

/**
 * Change the URL of the window.
 * Created to enable mocking this feature for testing
 */
export default function changeUrl(url) {
  if (config.environment === 'test') {
    window.testingURL = url;
  } else {
    location.href = url;
  }
}
