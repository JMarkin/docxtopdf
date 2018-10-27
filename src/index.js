try {
  if (PRODUCTION) {
    require('offline-plugin/runtime')
      .install();
  }
} catch (e) { console.log(e); }

export { default } from './components/app';
