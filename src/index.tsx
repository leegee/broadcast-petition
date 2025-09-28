import './index.scss';
import { render } from 'solid-js/web';
import 'solid-devtools';
import "beercss";
import App from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html?'
  );
}

// Simply render the app
render(() => <App />, root);
