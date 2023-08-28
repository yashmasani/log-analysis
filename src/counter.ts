import Plotly from 'plotly.js-dist-min';

export function setupLogOptions() : configInterface {
  const x = (document.querySelector('#xaxis-option')! as HTMLSelectElement).value as logDataType;
  const y = (document.querySelector('#yaxis-option')! as HTMLSelectElement).value as logDataType;
  const seperateContentConcerns = [] as contentType[];
   (document.querySelectorAll<HTMLInputElement>('#log-option-separate > input')!).forEach((child) => {
    if (child?.checked) {
      seperateContentConcerns.push(child.value as contentType);
    }
  });
  return {
    x,
    y,
    seperateContentConcerns
  }
}


export function setupChart(elementId:string, dataMap: Map<number, string[] | Map<contentType, string[]>>) {
  const xaxis:number[] = [];
  const yaxis:number[]|Array<number[]> = [];
  let traceNums = 1;
  let contentTypeList:contentType[] = [];
  dataMap.forEach((v, k) => {
    xaxis.push(k);
    if (Array.isArray(v)) {
      (yaxis as number[]).push((v as string[]).length);
    } else {
      if (contentTypeList.length == 0) {
        traceNums = v.size;
        contentTypeList = ([...v.keys()]);
      }
      const contentData = contentTypeList.map((t: contentType) => {
        const currContent = v.get(t);
        return currContent?.length || 0;
      });
      // [[1,2,3],[1,2,3]]
      (yaxis as Array<number[]>).push(contentData);
    }
  });
  const data:any[] = [];
  for (let i=0; i<traceNums; i+=1) {
    let x = xaxis;
    let y = yaxis;
    if (contentTypeList.length > 0) {
      y = (yaxis as Array<number[]>).map((contentList: number[]) => contentList[i]);
    }
    const trace = {
      name: contentTypeList[i],
      x: x as (number | string)[],
      y: y as (number | string)[],
      mode: 'markers',
      type: 'scatter',
      marker: { size: 12 }
    };
    data.push(trace);
  }
  const plotlyContainer:HTMLElement = document.querySelector('#plotly-container')!;
  let { width, height } = plotlyContainer.getBoundingClientRect();
  height = height ? height * 0.95 : 350;
  width = width ? width * 0.96 : 0;
  const color = '#e9e8e7d1';
  const layout = {
    height,
    width,
    title: {
      text: 'Log Analysis',
    },
    paper_bgcolor: color,
    plot_bgcolor: color,
    margin: {
      b: 40,
      l: 40,
      r: 40,
      t: 40
    }
  };
  plotlyContainer.style.backgroundColor = color;
  const config: Record<string, any> = { responsive: true };
  if (width < 500) {
    config.displayModeBar = false; 
  }
  Plotly.newPlot(elementId, data, layout, config);
}

export interface LogData {
  content: string;
  log_date: string;
  createdAt: number;
}

export function contentFilter(data: LogData[], searchText: string): LogData[] {
  return data.filter(x => x?.content?.includes(searchText));
}

type logDataType = 'content' | 'createdAt' | 'log_date'

type contentType = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR'

export interface configInterface {
  x: logDataType;
  y: logDataType;
  seperateContentConcerns?: contentType[];
  seperateKeywords?:string[];
}

export function preprocess(data: LogData[], config:configInterface={ x:'log_date', y:'content' }): Map<number, string[] | Map<contentType, string[]>> {
  const mapX = new Map();
  if (config.seperateContentConcerns && config.seperateContentConcerns.length > 0) {
    for (let i=0; i < data.length; i += 1) {
      const obj: LogData = data[i];
      if (!mapX.has(obj[config.x])) {
        const mapContent = new Map<contentType, string[]>()
        for (let contentConcerns of config.seperateContentConcerns) {
          mapContent.set(contentConcerns, []);
        }
        mapX.set(obj[config.x], mapContent);
      }
      const mapContent: Map<contentType, string[]> = mapX.get(obj[config.x]);
      for (let contentConcerns of config.seperateContentConcerns) {
        if ((obj[config.y] as string).includes(contentConcerns)) {
          const concernList = mapContent.get(contentConcerns);
          // @ts-expect-error concernList is set on line 102
          concernList.push(obj[config.y] as string);
        }
      }
    }
  } else {
    for (let i=0; i < data.length; i += 1) {
      const obj: LogData = data[i];
      if (mapX.has(obj[config.x])){
          const yLst = mapX.get(obj[config.x]);
          yLst.push(obj[config.y]);
      } else {
          mapX.set(obj[config.x], [obj[config.y]])
      }
    }
  }
  return mapX;
}

