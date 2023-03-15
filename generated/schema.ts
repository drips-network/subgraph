// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class UserMetadataByKey extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save UserMetadataByKey entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type UserMetadataByKey must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("UserMetadataByKey", id.toString(), this);
    }
  }

  static load(id: string): UserMetadataByKey | null {
    return changetype<UserMetadataByKey | null>(
      store.get("UserMetadataByKey", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get key(): Bytes {
    let value = this.get("key");
    return value!.toBytes();
  }

  set key(value: Bytes) {
    this.set("key", Value.fromBytes(value));
  }

  get value(): Bytes {
    let value = this.get("value");
    return value!.toBytes();
  }

  set value(value: Bytes) {
    this.set("value", Value.fromBytes(value));
  }

  get lastUpdatedBlockTimestamp(): BigInt {
    let value = this.get("lastUpdatedBlockTimestamp");
    return value!.toBigInt();
  }

  set lastUpdatedBlockTimestamp(value: BigInt) {
    this.set("lastUpdatedBlockTimestamp", Value.fromBigInt(value));
  }
}

export class UserMetadataEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save UserMetadataEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type UserMetadataEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("UserMetadataEvent", id.toString(), this);
    }
  }

  static load(id: string): UserMetadataEvent | null {
    return changetype<UserMetadataEvent | null>(
      store.get("UserMetadataEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get key(): Bytes {
    let value = this.get("key");
    return value!.toBytes();
  }

  set key(value: Bytes) {
    this.set("key", Value.fromBytes(value));
  }

  get value(): Bytes {
    let value = this.get("value");
    return value!.toBytes();
  }

  set value(value: Bytes) {
    this.set("value", Value.fromBytes(value));
  }

  get lastUpdatedBlockTimestamp(): BigInt {
    let value = this.get("lastUpdatedBlockTimestamp");
    return value!.toBigInt();
  }

  set lastUpdatedBlockTimestamp(value: BigInt) {
    this.set("lastUpdatedBlockTimestamp", Value.fromBigInt(value));
  }
}

export class User extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save User entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type User must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("User", id.toString(), this);
    }
  }

  static load(id: string): User | null {
    return changetype<User | null>(store.get("User", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get assetConfigs(): Array<string> {
    let value = this.get("assetConfigs");
    return value!.toStringArray();
  }

  set assetConfigs(value: Array<string>) {
    this.set("assetConfigs", Value.fromStringArray(value));
  }

  get splitsEntryIds(): Array<string> {
    let value = this.get("splitsEntryIds");
    return value!.toStringArray();
  }

  set splitsEntryIds(value: Array<string>) {
    this.set("splitsEntryIds", Value.fromStringArray(value));
  }

  get splitsEntries(): Array<string> {
    let value = this.get("splitsEntries");
    return value!.toStringArray();
  }

  set splitsEntries(value: Array<string>) {
    this.set("splitsEntries", Value.fromStringArray(value));
  }

  get splitsReceiversHash(): Bytes {
    let value = this.get("splitsReceiversHash");
    return value!.toBytes();
  }

  set splitsReceiversHash(value: Bytes) {
    this.set("splitsReceiversHash", Value.fromBytes(value));
  }

  get lastUpdatedBlockTimestamp(): BigInt {
    let value = this.get("lastUpdatedBlockTimestamp");
    return value!.toBigInt();
  }

  set lastUpdatedBlockTimestamp(value: BigInt) {
    this.set("lastUpdatedBlockTimestamp", Value.fromBigInt(value));
  }
}

export class UserAssetConfig extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save UserAssetConfig entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type UserAssetConfig must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("UserAssetConfig", id.toString(), this);
    }
  }

  static load(id: string): UserAssetConfig | null {
    return changetype<UserAssetConfig | null>(store.get("UserAssetConfig", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get user(): string {
    let value = this.get("user");
    return value!.toString();
  }

  set user(value: string) {
    this.set("user", Value.fromString(value));
  }

  get assetId(): BigInt {
    let value = this.get("assetId");
    return value!.toBigInt();
  }

  set assetId(value: BigInt) {
    this.set("assetId", Value.fromBigInt(value));
  }

  get dripsEntryIds(): Array<string> {
    let value = this.get("dripsEntryIds");
    return value!.toStringArray();
  }

  set dripsEntryIds(value: Array<string>) {
    this.set("dripsEntryIds", Value.fromStringArray(value));
  }

  get dripsEntries(): Array<string> {
    let value = this.get("dripsEntries");
    return value!.toStringArray();
  }

  set dripsEntries(value: Array<string>) {
    this.set("dripsEntries", Value.fromStringArray(value));
  }

  get balance(): BigInt {
    let value = this.get("balance");
    return value!.toBigInt();
  }

  set balance(value: BigInt) {
    this.set("balance", Value.fromBigInt(value));
  }

  get assetConfigHash(): Bytes {
    let value = this.get("assetConfigHash");
    return value!.toBytes();
  }

  set assetConfigHash(value: Bytes) {
    this.set("assetConfigHash", Value.fromBytes(value));
  }

  get amountSplittable(): BigInt {
    let value = this.get("amountSplittable");
    return value!.toBigInt();
  }

  set amountSplittable(value: BigInt) {
    this.set("amountSplittable", Value.fromBigInt(value));
  }

  get amountPostSplitCollectable(): BigInt {
    let value = this.get("amountPostSplitCollectable");
    return value!.toBigInt();
  }

  set amountPostSplitCollectable(value: BigInt) {
    this.set("amountPostSplitCollectable", Value.fromBigInt(value));
  }

  get amountCollected(): BigInt {
    let value = this.get("amountCollected");
    return value!.toBigInt();
  }

  set amountCollected(value: BigInt) {
    this.set("amountCollected", Value.fromBigInt(value));
  }

  get lastUpdatedBlockTimestamp(): BigInt {
    let value = this.get("lastUpdatedBlockTimestamp");
    return value!.toBigInt();
  }

  set lastUpdatedBlockTimestamp(value: BigInt) {
    this.set("lastUpdatedBlockTimestamp", Value.fromBigInt(value));
  }
}

export class DripsSetEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save DripsSetEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type DripsSetEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("DripsSetEvent", id.toString(), this);
    }
  }

  static load(id: string): DripsSetEvent | null {
    return changetype<DripsSetEvent | null>(store.get("DripsSetEvent", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get assetId(): BigInt {
    let value = this.get("assetId");
    return value!.toBigInt();
  }

  set assetId(value: BigInt) {
    this.set("assetId", Value.fromBigInt(value));
  }

  get receiversHash(): Bytes {
    let value = this.get("receiversHash");
    return value!.toBytes();
  }

  set receiversHash(value: Bytes) {
    this.set("receiversHash", Value.fromBytes(value));
  }

  get dripsReceiverSeenEvents(): Array<string> {
    let value = this.get("dripsReceiverSeenEvents");
    return value!.toStringArray();
  }

  set dripsReceiverSeenEvents(value: Array<string>) {
    this.set("dripsReceiverSeenEvents", Value.fromStringArray(value));
  }

  get dripsHistoryHash(): Bytes {
    let value = this.get("dripsHistoryHash");
    return value!.toBytes();
  }

  set dripsHistoryHash(value: Bytes) {
    this.set("dripsHistoryHash", Value.fromBytes(value));
  }

  get balance(): BigInt {
    let value = this.get("balance");
    return value!.toBigInt();
  }

  set balance(value: BigInt) {
    this.set("balance", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get maxEnd(): BigInt {
    let value = this.get("maxEnd");
    return value!.toBigInt();
  }

  set maxEnd(value: BigInt) {
    this.set("maxEnd", Value.fromBigInt(value));
  }
}

export class LastSetDripsUserMapping extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save LastSetDripsUserMapping entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type LastSetDripsUserMapping must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("LastSetDripsUserMapping", id.toString(), this);
    }
  }

  static load(id: string): LastSetDripsUserMapping | null {
    return changetype<LastSetDripsUserMapping | null>(
      store.get("LastSetDripsUserMapping", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get dripsSetEventId(): string {
    let value = this.get("dripsSetEventId");
    return value!.toString();
  }

  set dripsSetEventId(value: string) {
    this.set("dripsSetEventId", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get assetId(): BigInt {
    let value = this.get("assetId");
    return value!.toBigInt();
  }

  set assetId(value: BigInt) {
    this.set("assetId", Value.fromBigInt(value));
  }
}

export class DripsReceiverSeenEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save DripsReceiverSeenEvent entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type DripsReceiverSeenEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("DripsReceiverSeenEvent", id.toString(), this);
    }
  }

  static load(id: string): DripsReceiverSeenEvent | null {
    return changetype<DripsReceiverSeenEvent | null>(
      store.get("DripsReceiverSeenEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get dripsSetEvent(): string {
    let value = this.get("dripsSetEvent");
    return value!.toString();
  }

  set dripsSetEvent(value: string) {
    this.set("dripsSetEvent", Value.fromString(value));
  }

  get receiversHash(): Bytes {
    let value = this.get("receiversHash");
    return value!.toBytes();
  }

  set receiversHash(value: Bytes) {
    this.set("receiversHash", Value.fromBytes(value));
  }

  get senderUserId(): string {
    let value = this.get("senderUserId");
    return value!.toString();
  }

  set senderUserId(value: string) {
    this.set("senderUserId", Value.fromString(value));
  }

  get receiverUserId(): string {
    let value = this.get("receiverUserId");
    return value!.toString();
  }

  set receiverUserId(value: string) {
    this.set("receiverUserId", Value.fromString(value));
  }

  get config(): BigInt {
    let value = this.get("config");
    return value!.toBigInt();
  }

  set config(value: BigInt) {
    this.set("config", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }
}

export class DripsEntry extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save DripsEntry entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type DripsEntry must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("DripsEntry", id.toString(), this);
    }
  }

  static load(id: string): DripsEntry | null {
    return changetype<DripsEntry | null>(store.get("DripsEntry", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get sender(): string {
    let value = this.get("sender");
    return value!.toString();
  }

  set sender(value: string) {
    this.set("sender", Value.fromString(value));
  }

  get senderAssetConfig(): string {
    let value = this.get("senderAssetConfig");
    return value!.toString();
  }

  set senderAssetConfig(value: string) {
    this.set("senderAssetConfig", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get config(): BigInt {
    let value = this.get("config");
    return value!.toBigInt();
  }

  set config(value: BigInt) {
    this.set("config", Value.fromBigInt(value));
  }
}

export class ReceivedDripsEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ReceivedDripsEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type ReceivedDripsEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("ReceivedDripsEvent", id.toString(), this);
    }
  }

  static load(id: string): ReceivedDripsEvent | null {
    return changetype<ReceivedDripsEvent | null>(
      store.get("ReceivedDripsEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get assetId(): BigInt {
    let value = this.get("assetId");
    return value!.toBigInt();
  }

  set assetId(value: BigInt) {
    this.set("assetId", Value.fromBigInt(value));
  }

  get amt(): BigInt {
    let value = this.get("amt");
    return value!.toBigInt();
  }

  set amt(value: BigInt) {
    this.set("amt", Value.fromBigInt(value));
  }

  get receivableCycles(): BigInt {
    let value = this.get("receivableCycles");
    return value!.toBigInt();
  }

  set receivableCycles(value: BigInt) {
    this.set("receivableCycles", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }
}

export class SqueezedDripsEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save SqueezedDripsEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type SqueezedDripsEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("SqueezedDripsEvent", id.toString(), this);
    }
  }

  static load(id: string): SqueezedDripsEvent | null {
    return changetype<SqueezedDripsEvent | null>(
      store.get("SqueezedDripsEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get assetId(): BigInt {
    let value = this.get("assetId");
    return value!.toBigInt();
  }

  set assetId(value: BigInt) {
    this.set("assetId", Value.fromBigInt(value));
  }

  get senderId(): string {
    let value = this.get("senderId");
    return value!.toString();
  }

  set senderId(value: string) {
    this.set("senderId", Value.fromString(value));
  }

  get amt(): BigInt {
    let value = this.get("amt");
    return value!.toBigInt();
  }

  set amt(value: BigInt) {
    this.set("amt", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get dripsHistoryHashes(): Array<Bytes> {
    let value = this.get("dripsHistoryHashes");
    return value!.toBytesArray();
  }

  set dripsHistoryHashes(value: Array<Bytes>) {
    this.set("dripsHistoryHashes", Value.fromBytesArray(value));
  }
}

export class SplitsSetEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save SplitsSetEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type SplitsSetEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("SplitsSetEvent", id.toString(), this);
    }
  }

  static load(id: string): SplitsSetEvent | null {
    return changetype<SplitsSetEvent | null>(store.get("SplitsSetEvent", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get receiversHash(): Bytes {
    let value = this.get("receiversHash");
    return value!.toBytes();
  }

  set receiversHash(value: Bytes) {
    this.set("receiversHash", Value.fromBytes(value));
  }

  get splitsReceiverSeenEvents(): Array<string> {
    let value = this.get("splitsReceiverSeenEvents");
    return value!.toStringArray();
  }

  set splitsReceiverSeenEvents(value: Array<string>) {
    this.set("splitsReceiverSeenEvents", Value.fromStringArray(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }
}

export class LastSetSplitsUserMapping extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save LastSetSplitsUserMapping entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type LastSetSplitsUserMapping must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("LastSetSplitsUserMapping", id.toString(), this);
    }
  }

  static load(id: string): LastSetSplitsUserMapping | null {
    return changetype<LastSetSplitsUserMapping | null>(
      store.get("LastSetSplitsUserMapping", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get splitsSetEventId(): string {
    let value = this.get("splitsSetEventId");
    return value!.toString();
  }

  set splitsSetEventId(value: string) {
    this.set("splitsSetEventId", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }
}

export class SplitsReceiverSeenEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save SplitsReceiverSeenEvent entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type SplitsReceiverSeenEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("SplitsReceiverSeenEvent", id.toString(), this);
    }
  }

  static load(id: string): SplitsReceiverSeenEvent | null {
    return changetype<SplitsReceiverSeenEvent | null>(
      store.get("SplitsReceiverSeenEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get splitsSetEvent(): string {
    let value = this.get("splitsSetEvent");
    return value!.toString();
  }

  set splitsSetEvent(value: string) {
    this.set("splitsSetEvent", Value.fromString(value));
  }

  get receiversHash(): Bytes {
    let value = this.get("receiversHash");
    return value!.toBytes();
  }

  set receiversHash(value: Bytes) {
    this.set("receiversHash", Value.fromBytes(value));
  }

  get senderUserId(): string {
    let value = this.get("senderUserId");
    return value!.toString();
  }

  set senderUserId(value: string) {
    this.set("senderUserId", Value.fromString(value));
  }

  get receiverUserId(): string {
    let value = this.get("receiverUserId");
    return value!.toString();
  }

  set receiverUserId(value: string) {
    this.set("receiverUserId", Value.fromString(value));
  }

  get weight(): BigInt {
    let value = this.get("weight");
    return value!.toBigInt();
  }

  set weight(value: BigInt) {
    this.set("weight", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }
}

export class SplitsEntry extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save SplitsEntry entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type SplitsEntry must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("SplitsEntry", id.toString(), this);
    }
  }

  static load(id: string): SplitsEntry | null {
    return changetype<SplitsEntry | null>(store.get("SplitsEntry", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get sender(): string {
    let value = this.get("sender");
    return value!.toString();
  }

  set sender(value: string) {
    this.set("sender", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get weight(): BigInt {
    let value = this.get("weight");
    return value!.toBigInt();
  }

  set weight(value: BigInt) {
    this.set("weight", Value.fromBigInt(value));
  }
}

export class SplitEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save SplitEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type SplitEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("SplitEvent", id.toString(), this);
    }
  }

  static load(id: string): SplitEvent | null {
    return changetype<SplitEvent | null>(store.get("SplitEvent", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get receiverId(): string {
    let value = this.get("receiverId");
    return value!.toString();
  }

  set receiverId(value: string) {
    this.set("receiverId", Value.fromString(value));
  }

  get assetId(): BigInt {
    let value = this.get("assetId");
    return value!.toBigInt();
  }

  set assetId(value: BigInt) {
    this.set("assetId", Value.fromBigInt(value));
  }

  get amt(): BigInt {
    let value = this.get("amt");
    return value!.toBigInt();
  }

  set amt(value: BigInt) {
    this.set("amt", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }
}

export class CollectableEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save CollectableEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type CollectableEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("CollectableEvent", id.toString(), this);
    }
  }

  static load(id: string): CollectableEvent | null {
    return changetype<CollectableEvent | null>(
      store.get("CollectableEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get user(): string {
    let value = this.get("user");
    return value!.toString();
  }

  set user(value: string) {
    this.set("user", Value.fromString(value));
  }

  get assetId(): BigInt {
    let value = this.get("assetId");
    return value!.toBigInt();
  }

  set assetId(value: BigInt) {
    this.set("assetId", Value.fromBigInt(value));
  }

  get amt(): BigInt {
    let value = this.get("amt");
    return value!.toBigInt();
  }

  set amt(value: BigInt) {
    this.set("amt", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }
}

export class CollectedEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save CollectedEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type CollectedEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("CollectedEvent", id.toString(), this);
    }
  }

  static load(id: string): CollectedEvent | null {
    return changetype<CollectedEvent | null>(store.get("CollectedEvent", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get user(): string {
    let value = this.get("user");
    return value!.toString();
  }

  set user(value: string) {
    this.set("user", Value.fromString(value));
  }

  get assetId(): BigInt {
    let value = this.get("assetId");
    return value!.toBigInt();
  }

  set assetId(value: BigInt) {
    this.set("assetId", Value.fromBigInt(value));
  }

  get collected(): BigInt {
    let value = this.get("collected");
    return value!.toBigInt();
  }

  set collected(value: BigInt) {
    this.set("collected", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }
}

export class GivenEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save GivenEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type GivenEvent must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("GivenEvent", id.toString(), this);
    }
  }

  static load(id: string): GivenEvent | null {
    return changetype<GivenEvent | null>(store.get("GivenEvent", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get receiverUserId(): string {
    let value = this.get("receiverUserId");
    return value!.toString();
  }

  set receiverUserId(value: string) {
    this.set("receiverUserId", Value.fromString(value));
  }

  get assetId(): BigInt {
    let value = this.get("assetId");
    return value!.toBigInt();
  }

  set assetId(value: BigInt) {
    this.set("assetId", Value.fromBigInt(value));
  }

  get amt(): BigInt {
    let value = this.get("amt");
    return value!.toBigInt();
  }

  set amt(value: BigInt) {
    this.set("amt", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }
}

export class App extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save App entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type App must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("App", id.toString(), this);
    }
  }

  static load(id: string): App | null {
    return changetype<App | null>(store.get("App", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get appAddress(): Bytes {
    let value = this.get("appAddress");
    return value!.toBytes();
  }

  set appAddress(value: Bytes) {
    this.set("appAddress", Value.fromBytes(value));
  }

  get lastUpdatedBlockTimestamp(): BigInt {
    let value = this.get("lastUpdatedBlockTimestamp");
    return value!.toBigInt();
  }

  set lastUpdatedBlockTimestamp(value: BigInt) {
    this.set("lastUpdatedBlockTimestamp", Value.fromBigInt(value));
  }
}

export class NFTSubAccount extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save NFTSubAccount entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type NFTSubAccount must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("NFTSubAccount", id.toString(), this);
    }
  }

  static load(id: string): NFTSubAccount | null {
    return changetype<NFTSubAccount | null>(store.get("NFTSubAccount", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get ownerAddress(): Bytes {
    let value = this.get("ownerAddress");
    return value!.toBytes();
  }

  set ownerAddress(value: Bytes) {
    this.set("ownerAddress", Value.fromBytes(value));
  }
}

export class ImmutableSplitsCreated extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save ImmutableSplitsCreated entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type ImmutableSplitsCreated must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("ImmutableSplitsCreated", id.toString(), this);
    }
  }

  static load(id: string): ImmutableSplitsCreated | null {
    return changetype<ImmutableSplitsCreated | null>(
      store.get("ImmutableSplitsCreated", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get userId(): string {
    let value = this.get("userId");
    return value!.toString();
  }

  set userId(value: string) {
    this.set("userId", Value.fromString(value));
  }

  get receiversHash(): Bytes {
    let value = this.get("receiversHash");
    return value!.toBytes();
  }

  set receiversHash(value: Bytes) {
    this.set("receiversHash", Value.fromBytes(value));
  }
}
