
import * as webpack from 'webpack';
import { BaseConfigFactory } from './base-config-factory';
import { FrontendConfigFactory } from './frontend-config-factory';
import { BackendConfigFactory } from './backend-config-factory';
import { CliContext } from '../../context';
import * as merge from 'webpack-merge';
import { HookExecutor } from '../../hook';
const chalk = require('chalk');

export class ConfigFactory {
    async create(context: CliContext): Promise<webpack.Configuration[]> {
        const configurations = [];
        const baseConfig = new BaseConfigFactory().create(context);

        const configFactories = [new FrontendConfigFactory(),  new BackendConfigFactory()];
        for (const configFactory of configFactories) {
            if (configFactory.support(context)) {
                const config = merge(baseConfig, configFactory.create(context));
                const webpackHook = context.config.webpack || ((c: webpack.Configuration, ctx: CliContext) => config);
                configurations.push(webpackHook(config, context));
                console.log(chalk`malagu {green target} - ${ configurations[configurations.length - 1].name }`);
            }
        }
        await new HookExecutor().executeWebpackHooks({
            pkg: context.pkg,
            cliContext: context,
            configurations: configurations
        });
        return configurations;
    }
}
