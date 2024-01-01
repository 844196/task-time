## :twisted_rightwards_arrows: Branch naming conventions

```
{github username}/{base branch}/{topic name}
```

e.g. `844196/main/some-topic`

## :speech_balloon: Commit message conventions

See [gitmoji](https://gitmoji.dev/).

## :hammer: Development scripts

Requirements [go-task/task](https://taskfile.dev/).

### Lint

```sh
task lint
```

or

```sh
task lint:prettier
task lint:tsc
task lint:eslint
```

### Testing

```sh
task test
```

### Build

```sh
task build
```

## :rocket: Release workflow

```mermaid
sequenceDiagram
  actor Owner
  create participant prepare_release as Workflow:prepare_release
  Owner ->> prepare_release: patch/minor/major を選んで実行
  prepare_release ->> prepare_release: リリースブランチを作成
  prepare_release ->> prepare_release: "npm version" を実行
  prepare_release ->> prepare_release: 更新された "package.json" と "package-lock.json" をコミット
  create participant pr as Pull request
  prepare_release ->> pr: "Release" ラベル付きPRを作成
  destroy prepare_release
  prepare_release ->> pr: 自動マージを有効化
  create participant ci as Workflow:CI
  pr ->> ci: ディスパッチ
  ci ->> ci: テストを実行
  destroy ci
  ci ->> pr: OK
  destroy pr
  pr ->> main: 自動マージ
  note right of main: "Release" ラベル付きPRのマージを検出
  create participant release as Workflow:release
  participant main
  main ->> release: ディスパッチ
  release ->> release: 新しいバージョンを算出
  release ->> main: バージョンタグをプッシュ
  destroy release
  participant releases as Releases
  release ->> releases: リリースを作成
  note right of releases: 新しいリリース作成を検出
  create participant publish as Workflow:publish
  releases ->> publish: ディスパッチ
  publish ->> publish: ビルド
  destroy publish
  participant npm
  publish ->> npm: 新しいバージョンを公開
```
