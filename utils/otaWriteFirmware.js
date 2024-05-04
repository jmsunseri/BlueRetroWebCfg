import { brUuid, cfg_cmd_ota_abort, cfg_cmd_ota_end, cfg_cmd_ota_start } from "../svelte/src/lib/constants.js";
import otaWriteFwRecursive from "../utils/otaWriteFwRecursive.js";

export const otaWriteFirmware = (brService, data, setProgress, cancel) => {
  var cmd = new Uint8Array(1);
  let ctrl_chrc = null;
  return new Promise((resolve, reject) => {
    brService
      .getCharacteristic(brUuid[7])
      .then((chrc) => {
        ctrl_chrc = chrc;
        cmd[0] = cfg_cmd_ota_start;
        return ctrl_chrc.writeValue(cmd);
      })
      .then((_) => {
        return brService.getCharacteristic(brUuid[8]);
      })
      .then((chrc) => {
        return otaWriteFwRecursive(chrc, data, 0, setProgress, cancel);
      })
      .then((_) => {
        cmd[0] = cfg_cmd_ota_end;
        return ctrl_chrc.writeValue(cmd);
      })
      .then((_) => {
        resolve();
      })
      .catch((error) => {
        cmd[0] = cfg_cmd_ota_abort;
        return ctrl_chrc.writeValue(cmd).then((_) => {
          reject(error);
        });
      });
  });
};

export default otaWriteFirmware;
