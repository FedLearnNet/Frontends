import {Component} from '@angular/core';
import {MarkdownComponent} from "ngx-markdown";
import {provideMarkdown} from 'ngx-markdown';

@Component({
  selector: 'app-app-detail-setup',
  standalone: true,
  imports: [
    MarkdownComponent
  ],
  providers: [
    provideMarkdown(),
  ],
  templateUrl: './app-detail-setup.component.html',
  styleUrl: './app-detail-setup.component.scss'
})
export class AppDetailSetupComponent {

  public setupDependencies: string = '```python\npython3 -m pip install --extra-index-url https://test.pypi.org/simple/ pyfedappwrap';

  public setupMain: string = '```python\n' +
    'engine = FedDBEngine()\n' +
    '\n' +
    'engine.register(MyAPP())\n' +
    '\n' +
    'if __name__ == \'__main__\':\n' +
    '    engine.start()\n' +
    '    engine.wait_until_stop()';

  public setupConfig: string = '```dotenv\nAPP_ID=YOUR_APP_ID\n' +
    'ENABLE_CONFIG_SYNC=true\n' +
    'TRACE_PERFORMANCE=false\n' +
    'ENABLE_PROJECT_STARTUP=false\n' +
    '\n' +
    'MODEL_DIR=./\n' +
    'DATA_DIR=./data/\n' +
    '\n' +
    'WS_URL=wss://posymed.featurecloud.ai/api/testembed/';

  public setupConfigPydantic: string = '```python\n' +
    'from pydantic.dataclasses import dataclass\n' +
    'from pyfedappwrap.learning.run_runfig import AppConfig, AppInputConfig, AppOutputConfig\n' +
    '\n' +
    '\n' +
    '@dataclass\n' +
    'class MyAppConfig(AppConfig):\n' +
    '    pass\n\n' +
    '@dataclass\n' +
    'class MyAppInputConfig(AppInputConfig):\n' +
    '    pass\n\n' +
    '@dataclass\n' +
    'class MyAppOutputConfig(AppOutputConfig):\n' +
    '    pass\n\n';

  public setupRun: string = '```python' +
    '\nfrom pyfedappwrap.learning.base_app import BaseApp\n\n\n' +
    'class MyAPP(BaseApp[MyAppConfig, MyAppInputConfig, MyAppOutputConfig]):\n' +
    '\n' +
    '    def __init__(self):\n' +
    '        super().__init__() \n\n' +
    '    def run_train(self, data: MyAppInputConfig) -> MyAppOutputConfig:\n' +
    '        pass\n\n' +
    '    def run_prediction(self, data: MyAppInputConfig) -> MyAppOutputConfig:\n' +
    '        pass\n\n' +
    '   def _save(self) -> str:\n' +
    '        pass\n\n' +
    '   def _load(self, path: str):\n' +
    '        pass\n```';

}
