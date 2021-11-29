# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.0.2](https://github.com/fluxprotocol/oracle-provider-core/compare/v2.0.1...v2.0.2) (2021-11-29)


### Bug Fixes

* **calcStakeAmount:** Fix issue where first window bondsize was calculated wrongly ([fccaf1c](https://github.com/fluxprotocol/oracle-provider-core/commit/fccaf1c1d17c1738d97ff2a4b3a84feccee17b5f))

### [2.0.1](https://github.com/fluxprotocol/oracle-provider-core/compare/v2.0.0...v2.0.1) (2021-11-22)


### Bug Fixes

* **claiming:** Fix issue where claiming was not possible ([bd230d0](https://github.com/fluxprotocol/oracle-provider-core/commit/bd230d06520d2371e3d6919805b5be110f8857d3))

## [2.0.0](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.9.0...v2.0.0) (2021-11-22)


### ⚠ BREAKING CHANGES

* **protocol:** Protocol changes

### Features

* **protocol:** Add support for first party oracles ([02fcfe4](https://github.com/fluxprotocol/oracle-provider-core/commit/02fcfe48a51f3ef3f7468ce6dd50e050eb7acc69))

## [1.9.0](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.8.0...v1.9.0) (2021-11-09)


### Features

* **request:** Add requiredEnvVariables for future use ([523993d](https://github.com/fluxprotocol/oracle-provider-core/commit/523993d84a8e19a4b02f2589dcc57e907d4992b4))

## [1.8.0](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.7.0...v1.8.0) (2021-11-08)


### Features

* **request:** Add tags and requester ([eda6382](https://github.com/fluxprotocol/oracle-provider-core/commit/eda6382fd9e1e3229e83f4e8fc218c9e35b291d7))

## [1.7.0](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.6.1...v1.7.0) (2021-10-26)


### Features

* **provider:** Add logger as required dependency ([6c7f1f0](https://github.com/fluxprotocol/oracle-provider-core/commit/6c7f1f0a66ae937f941ae99289a8ac4af5d21746))

### [1.6.1](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.6.0...v1.6.1) (2021-10-18)


### Bug Fixes

* **request:** Fix issue where final arbitrator requests would not auto-claim ([7dc21bc](https://github.com/fluxprotocol/oracle-provider-core/commit/7dc21bca2f2221c77152d941becd09c1606ffd6f))

## [1.6.0](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.5.0...v1.6.0) (2021-10-04)


### Features

* **request:** Add support for checking if a request can be finalized ([d6c7cd8](https://github.com/fluxprotocol/oracle-provider-core/commit/d6c7cd868a9d944a36ea299ccffe447b98a79a24))

## [1.5.0](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.4.1...v1.5.0) (2021-09-29)


### Features

* **balance:** Keep track of where the stake goes ([0643ce7](https://github.com/fluxprotocol/oracle-provider-core/commit/0643ce78935c11fc67a98b4ed2dffd89fae59101))

### [1.4.1](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.4.0...v1.4.1) (2021-08-31)


### Bug Fixes

* **balance:** Fix issue where 0 balance would still be able to stake ([15466ef](https://github.com/fluxprotocol/oracle-provider-core/commit/15466ef40b653cf0e65e4fd4a87a4f097bc5a325))

## [1.4.0](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.3.0...v1.4.0) (2021-08-31)


### Features

* **request:** Add support for using balances when bond is too high ([9615cd7](https://github.com/fluxprotocol/oracle-provider-core/commit/9615cd7091b9b26aaf4a0b1a8597a4ec24bbeeab))

## [1.3.0](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.2.0...v1.3.0) (2021-08-31)


### Features

* **request:** Add support for calcStakeAmount ([e6d6dfd](https://github.com/fluxprotocol/oracle-provider-core/commit/e6d6dfd8d5e9df30ff88d9523268f64adfe0284b))

## [1.2.0](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.1.2...v1.2.0) (2021-08-25)


### Features

* **balance:** Add profit property to balances ([db3d786](https://github.com/fluxprotocol/oracle-provider-core/commit/db3d7862453a0ef71a0d0d364ddcb87a2d8585cd))

### [1.1.2](https://github.com/fluxprotocol/oracle-provider-core/compare/v1.1.0...v1.1.2) (2021-08-18)


### Bug Fixes

* **package:** Fix issue with out of sync package lock ([dd0c1cc](https://github.com/fluxprotocol/oracle-provider-core/commit/dd0c1ccdafd25b812ef2cebd5e90b818b5e7af8f))

## 1.1.0 (2021-08-18)


### Features

* Core for the oracle ([981fde8](https://github.com/fluxprotocol/oracle-provider-core/commit/981fde8895a928cf6f4d618fb7097e115b2a83e7))
