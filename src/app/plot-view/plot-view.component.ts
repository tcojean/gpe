import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { JsonPipe } from '@angular/common';


import { Chart } from 'chart.js';
import * as jsonata from 'jsonata';


import { KeysPipe } from '../keys.pipe';
import { PropertyPipe } from '../property.pipe';
import { PlotScript } from '../plot-script';
import { DataFile } from '../data-file';
import { PlotConfigService } from '../plot-config.service';
import { PlotDataService } from '../plot-data.service';
import { DEFAULT_RAW_DATA } from '../default-form-values';

@Component({
  selector: 'app-plot-view',
  templateUrl: './plot-view.component.html',
  styleUrls: ['./plot-view.component.css']
})
export class PlotViewComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas;

  constructor(
    private configService: PlotConfigService,
    private dataService: PlotDataService
  ) { }

  ngOnInit() {
  }

  @Input()
  set data_files(data_files: string[]) {
    if (!data_files || data_files.length == 0) {
      return;
    }
    this.dataService.getDataFiles(data_files)
      .subscribe(rawData => {
        this.rawData = rawData;
        this.updateData();
      });
  }
  get data_files(): string[] {
    return this.rawData.map(file => file.name);
  }
  rawData: any[] = DEFAULT_RAW_DATA;

  @Input()
  set transformProgram(program: jsonata.Expression) {
    if (program) {
      this.transformProgram_ = program;
    }
    this.updateData();
  }
  get transformProgram(): jsonata.Expression {
    return this.transformProgram_;
  }
  private transformProgram_: jsonata.Expression;

  updateData(): void {
    console.log("program");
    console.log(this.transformProgram);
    console.log("input");
    console.log(this.rawData);
    try {
      this.transformedData = this.transformProgram.evaluate(this.rawData);
    } catch(e) {
      this.transformedData = { "Runtime error" : e };
    }
    console.log("output");
    console.log(this.transformedData);
    this.redrawPlot();
  }

  redrawPlot(): void {
    if (this.plot) {
      this.plot.destroy();
    }
    let ctx = this.chartCanvas.nativeElement.getContext("2d");
    let copy = this.copyObject(this.transformedData);
    try {
      this.plot = new Chart(ctx, copy);
    } catch (e) {
      console.log("Error generating chart:");
      console.log(e);
    }
  }

  private copyObject(obj: any): any {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  editorOptions: any = {
    theme: 'vs',
    language: 'json',
    automaticLayout: true,
    readOnly: true
  };

  transformedData: any = [];

  private plot: Chart;
}