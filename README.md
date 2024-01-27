# Lighthouse automation

### Test

Run automation tests to get average and median metrics values.

```sh
$ yarn test -u http://localhost:3000 -c 5 -t 5000 -o result.json
```

**Params**

| Short | Long        | Description                                                         |
| ----- | ----------- | ------------------------------------------------------------------- |
| `-u`  | `--url`     | Url to test. Default is `http://localhost:3000`                     |
| `-c`  | `--count`   | Number of iterations. Default is `5`                                |
| `-t`  | `--timeout` | Interval between iterations in ms. Default is `5000`                |
| `-o`  | `--output`  | File path where the results will be saved. Default is `result.json` |

### Diff

Generate a difference report based on the results of the two tests.

```sh
$ yarn diff -b before.json -a after.json -o diff.md
```

**Params**

| Short | Long       | Description                                                     |
| ----- | ---------- | --------------------------------------------------------------- |
| `-b`  | `--before` | Test results file. `Required`                                   |
| `-a`  | `--after`  | Test results file. `Required`                                   |
| `-o`  | `--output` | File path where the results will be saved. Default is `diff.md` |

### Compare

Run tests on two urls and generate a difference report.

```sh
$ yarn compare -b http://localhost:3000/pageA -a http://localhost:3000/pageB -d example
```

**Params**

| Short | Long        | Description                                                           |
| ----- | ----------- | --------------------------------------------------------------------- |
| `-b`  | `--before`  | Url to test. `Required`                                               |
| `-a`  | `--after`   | Url to test. `Required`                                               |
| `-c`  | `--count`   | Number of iterations. Default is `5`                                  |
| `-t`  | `--timeout` | Interval between iterations in ms. Default is `5000`                  |
| `-d`  | `--dir`     | Directory where the files will be saved. Default is current directory |

### Example

You can find examples of scripts results in the [example folder](example/)
