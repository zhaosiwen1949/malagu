
import * as webpack from 'webpack';
import * as path from 'path';
import { CliContext } from '../../context';
import { BACKEND_TARGET } from '../../constants';

export class BackendConfigFactory {
    create(context: CliContext): webpack.Configuration {
        const { pkg, port, open } = context;
        const outputPath = path.resolve(pkg.projectPath, context.dest, BACKEND_TARGET);

        const config = pkg.backendConfig;
        let entry: any = config.entry;
        const type = config.deployConfig ? config.deployConfig.type : undefined;
        if (type && entry && typeof entry !== 'string') {
            entry = entry[type];
        }

        entry = pkg.resolveModule(entry.split(path.sep).join('/'));
        return <webpack.Configuration>{
            name: BACKEND_TARGET,
            entry: entry,
            target: 'node',
            devtool: 'source-map',
            output: {
                path: outputPath,
                filename: 'index.js',
                libraryTarget: 'umd'
            },
            devServer: {
                port,
                open,
                writeToDisk: true
            },
            plugins: [
                new webpack.EnvironmentPlugin({
                    'MALAGU_CONFIG': config
                })
            ],
            module: {
                rules: [
                    {
                        test: /malagu([\\/]packages)?[\\/]core[\\/]lib[\\/]common[\\/]container[\\/]dynamic-container\.js$/,
                        use: {
                            loader: 'component-loader',
                            options: {
                                target: 'backend',
                                modules: Array.from(pkg.backendModules.values())
                            }
                        }
                    },
                ]
            }
        };
    }

    support(context: CliContext): boolean {
        const { pkg: { backendConfig } } = context;
        const config = backendConfig;

        return context.pkg.backendModules.size > 0 && (!config.targets || config.targets.includes(BACKEND_TARGET));
    }
}
