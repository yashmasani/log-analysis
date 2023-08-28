import './style.css'
import {
  setupChart,
  preprocess,
  setupLogOptions
} from './counter';
import type { LogData } from './counter';


/*
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
* */
//setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

let mock: LogData[] = [
  {
    content: '[DEBUG]: [\"initialized\"]',
    log_date: '2023-08-04',
    createdAt: 1691186274
  },
  {
    content: '[INFO]: Started at Fri, 04 Aug 2023 21:57:54 GMT',
    log_date: '2023-08-04',
    createdAt: 1691186274
  }
];

setupChart('log-chart', preprocess(mock));

(async () => {
  const m = await fetch('https://timeoff.lol/log-activities', {
    method: 'GET',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  mock = await m.json();
  setupChart('log-chart', preprocess(mock));
})();


document.querySelector('#log-options-apply')!.addEventListener('click', () => {
  const config = setupLogOptions();
  setupChart('log-chart', preprocess(mock, config));
});

