import Base from './Base';
import Network from './Network';
import Caster from './Caster';
import {NtripClient} from 'react-native-ntrip-client';
import waitForEvent from 'wait-for-event-promise';
global.Buffer = global.Buffer || require('buffer').Buffer;

export const FAKE_MOUNTPOINT = 'TEST'; // TODO: find a universal fake mountpoint name
export const ENDSOURCETABLE = 'ENDSOURCETABLE';
export const SOURCETABLE_LINE_SEPARATOR = '\n';
export const STREAM_IDENTIFIER = 'STR';
export const NETWORK_IDENTIFIER = 'NET';
export const CASTER_IDENTIFIER = 'CAS';
export const CSV_SEPARATOR = ';';

export type SourceTableEntries = {
  baseList: Array<Base>;
  networkList: Array<Network>;
  casterList: Array<Caster>;
};
export default class SourceTable {
  get entries(): SourceTableEntries {
    return this._entries;
  }

  set entries(value: SourceTableEntries) {
    this._entries = value;
  }

  private _entries: SourceTableEntries;
  adress: string;
  port: number;
  username: string;
  password: string;

  constructor(
    adress: string,
    port: number,
    username: string,
    password: string,
  ) {
    this.adress = adress;
    this.port = port;
    this.username = username;
    this.password = password;
  }

  async getSourceTable(
    adress?: string,
    port?: number,
    username?: string,
    password?: string,
  ) {
    let rawSourceTable = '';
    if (adress == null) {
      adress = this.adress;
    }
    if (port == null) {
      port = 2101;
    }
    if (username == null) {
      username = 'test@test.com'; // like rtk2go logs
    }
    if (password == null) {
      password = 'none';
    }
    try {
      const connectionOptions = {
        host: adress,
        port: port,
        mountpoint: FAKE_MOUNTPOINT,
        username: username,
        password: password,
        userAgent: 'NTRIP',
        xyz: [-1983430.2365, -4937492.4088, 3505683.7925],
        interval: 2000,
      };

      const client = new NtripClient(connectionOptions);
      const rawSourceTablePromise = waitForEvent(client, 'response'); // used to convert an event into a promise

      client.on('data', data => {
        rawSourceTable =
          rawSourceTable + data.toString() + SOURCETABLE_LINE_SEPARATOR;
        if (data.toString().indexOf(ENDSOURCETABLE) !== -1) {
          client.emit('response', rawSourceTable);
          client.close();
        }
      });

      client.on('response', data => {
        data;
      });

      client.on('error', err => {
        console.log(err);
        client.close();
      });

      client._connect();
      this.entries = this.parseSourceTable(await rawSourceTablePromise);
    } catch (error) {
      console.error(error);
      throw new Error('Impossible to get the Source Table');
    }
  }

  parseSourceTable(rawSourceTable: string) {
    const entries: SourceTableEntries = {
      baseList: [],
      casterList: [],
      networkList: [],
    };

    const lines = rawSourceTable.split(SOURCETABLE_LINE_SEPARATOR);
    let firstLine: number = -1;
    let lastLine: number = -1;
    for (let i = 0; i < lines.length; i++) {
      if (this.isSourceTableEntry(lines[i]) && firstLine === -1) {
        firstLine = i;
      } else if (lines[i] === ENDSOURCETABLE) {
        lastLine = i;
        //TODO: save in cache
        break;
      }
      if (lastLine === -1 && firstLine !== -1 && this.isCasterEntry(lines[i])) {
        entries.casterList.push(
          new Caster(this, lines[i].split(CSV_SEPARATOR)),
        );
      } else if (
        lastLine === -1 &&
        firstLine !== -1 &&
        this.isNetworkEntry(lines[i])
      ) {
        entries.networkList.push(
          new Network(this, lines[i].split(CSV_SEPARATOR)),
        );
      } else if (
        lastLine === -1 &&
        firstLine !== -1 &&
        this.isStreamEntry(lines[i])
      ) {
        entries.baseList.push(new Base(this, lines[i].split(CSV_SEPARATOR)));
      } else {
        //TODO: handle unparsable lines
      }
    }
    return entries;
  }

  isCasterEntry(line: string): boolean {
    return line.startsWith(CASTER_IDENTIFIER);
  }

  isNetworkEntry(line: string): boolean {
    return line.startsWith(NETWORK_IDENTIFIER);
  }

  isStreamEntry(line: string): boolean {
    return line.startsWith(STREAM_IDENTIFIER);
  }

  isSourceTableEntry(line: string): boolean {
    return (
      this.isCasterEntry(line) ||
      this.isNetworkEntry(line) ||
      this.isStreamEntry(line)
    );
  }

  getMockSourceTable() {
    this.entries = {
      baseList: [],
      casterList: [],
      networkList: [],
    };
    for (var i = 0; i < 5; i++) {
      this.entries.networkList.push(new Network(this, []));
      this.entries.baseList.push(new Base(this, []));
      this.entries.casterList.push(new Caster(this, []));
    }
  }
}
