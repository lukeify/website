# Website

## `cloud-init`

`cloud-config.yaml` declares the configuration to initialize a compute instance on DigitalOcean via `cloud-init`, performing the following operations:

* Updating `apt`, installing `nginx`.
* Creating `luke` user.
* Standard server hardening (disabling `ssh` for `root`, etc).

This configuration is then linted via GitHub Actions.