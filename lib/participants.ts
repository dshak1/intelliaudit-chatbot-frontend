export interface Participant {
  token: string
  firstName: string
  lastName: string
  email: string
  group: "Auditor" | "Group 2"
  org: string
}

export const participants: Participant[] = [
  { token: "1551dce8-3b42-43ce-b426-7f1c298c9c20", firstName: "Dean", lastName: "Konencamp", email: "dkonenkamp@gmail.com", group: "Auditor", org: "Coke-a-Cola" },
  { token: "36d739a3-5419-4b16-a80e-8c56d8187b78", firstName: "Reza", lastName: "Bagheri", email: "reza.bagheri2570@gmail.com", group: "Auditor", org: "Telus" },
  { token: "ca2c6600-7e9f-4054-8c09-809d655299ab", firstName: "Steve", lastName: "Konencamp", email: "sjkone@bellsouth.net", group: "Auditor", org: "EY" },
  { token: "1fbbda61-5bc3-48ac-a54e-4cf7c29e0e48", firstName: "Ebony", lastName: "Thomas", email: "ebony.s.thomas@gmail.com", group: "Group 2", org: "Alliant Insurance Services" },
  { token: "94bff156-ea50-4e15-b74f-f7aeb88f9c92", firstName: "Rana Fahad", lastName: "Aman", email: "rfa57@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "0322f363-5a63-4eda-8a98-426d8395ec92", firstName: "Mohsen", lastName: "Babanejad Khademloo", email: "mba259@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "ccd795b0-f784-4387-8d84-ca86ecd97fba", firstName: "Mohammad", lastName: "Badr", email: "mba284@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "406076f6-4e6e-4235-88ff-32d09066d20f", firstName: "Amer", lastName: "Banaweer", email: "aab39@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "d5eb3961-a9b3-4218-90ba-2a12c9585ed9", firstName: "Mangesh", lastName: "Bhattacharya", email: "mba286@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "a9e9867f-0c32-4ccb-8920-7321977b763a", firstName: "Devansh Narendrakumar", lastName: "Bhojak", email: "dbhojak@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "46f051e4-081a-4c79-9764-304c25863852", firstName: "Dean Alexander", lastName: "Buño", email: "dab23@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "de615d90-23d9-400e-b724-10c2482faa6b", firstName: "Javier", lastName: "Cabrera Gonzalez", email: "jca638@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "a50af9b7-93a4-45e3-a2b7-996e23e1d87d", firstName: "Jaspartap", lastName: "Chahal", email: "jsc48@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "178cbc43-ea75-45fc-83bb-8481e76b84dd", firstName: "Joshua", lastName: "Chen", email: "jgc20@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "8e4f3550-5a8c-48a2-a545-a29511af27ce", firstName: "Sebastian", lastName: "Finch", email: "sgf5@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "d07a7774-3abf-4911-bb6a-66f66bd3153b", firstName: "Shadman", lastName: "Hossain", email: "shadmanh@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "df6e62fd-4356-40ff-8a65-c5323df434f6", firstName: "Wania", lastName: "Imran", email: "wia3@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "c541b92b-5730-4ba8-a23e-fb8cafdfa45b", firstName: "Sanjit", lastName: "Mann", email: "sma216@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "996764ef-9c94-4695-bc8d-039496098ada", firstName: "Xin Hui", lastName: "Qiu", email: "ninaq@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "4dcdcf1b-825d-4d5a-b2ba-6d26e4e98112", firstName: "Tanish", lastName: "Rathore", email: "tra45@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "3a70a82d-dd73-499d-8154-efa5c6549cec", firstName: "Alyssa", lastName: "Rusk", email: "arusk@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "aad225cb-d129-44bd-8e54-ac7ec43e2f99", firstName: "Ashmeet", lastName: "Singh", email: "asa684@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "8034ae11-2b34-42b2-81a9-e062d467cfa9", firstName: "Oliver", lastName: "Stutz", email: "osa37@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "832a32d7-2980-4551-b326-8a471a1aea8c", firstName: "Shakthi Vel", lastName: "Venkatesan", email: "svv3@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "e14f5c87-881d-4518-9e9a-f30dad4d6ee5", firstName: "Yaoting", lastName: "Wang", email: "ywa491@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "6edc68a2-30fe-441d-89c7-e0974c5019ef", firstName: "Kaiyang", lastName: "Wu", email: "kwa154@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "89ad5a1d-4d55-43ba-a388-025c8676e3aa", firstName: "Zihan", lastName: "Zhang", email: "zza344@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "4fef5182-410e-4639-b6cc-7fe56e9326bd", firstName: "Zijun", lastName: "Zhang", email: "zza341@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "c92e26f6-8215-4993-9cce-4e0545303dce", firstName: "Lubo", lastName: "Zhou", email: "lza185@sfu.ca", group: "Group 2", org: "MPCS CY'25" },
  { token: "77aec286-2851-4c29-b8f6-bac86337036d", firstName: "Cao", lastName: "Chunpeng", email: "cca298@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "7ffc6560-7355-4f0e-9bed-ddc3b4036120", firstName: "Chen", lastName: "Yu", email: "yca518@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "0e0f3b27-ab2c-47ab-bb50-806f0d5018f0", firstName: "Chiang", lastName: "Jr-Cheng", email: "jca615@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "e48ac1bb-0b09-4d40-97d3-e7661fbe2bd3", firstName: "Deng", lastName: "Zecheng", email: "zda35@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "f05812c1-aaa8-48f6-9870-40b1ecb79c41", firstName: "Fan", lastName: "Lingxuan", email: "lfa27@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "2fc44d54-7254-4d7b-bc79-8b55f977eaa9", firstName: "Fung", lastName: "William", email: "wfa15@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "2ac4ec37-0f97-48d7-a79a-dddb486994e1", firstName: "Gotamco", lastName: "Justin Jude", email: "jjg28@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "b5936057-b8a1-4c79-af54-83d3260ab222", firstName: "Han", lastName: "Yang", email: "hanyangh@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "987456a5-b155-4481-b4ef-30d89d211352", firstName: "Jia", lastName: "Yuwen", email: "yuwenj@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "1b34c290-7245-49b2-9704-474a35a384d0", firstName: "Li", lastName: "Yanyi", email: "yla882@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "afee3540-b2ce-43c9-8262-e5dcadde6ee6", firstName: "Nedungadi", lastName: "Vrushal", email: "vna28@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "356e7c1c-2ed9-4918-983a-f0aa57fff335", firstName: "Pathak", lastName: "Mansi", email: "mpa143@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "5a482ea3-1c1f-46d6-94d4-92b4ee8ee529", firstName: "Pisharodi", lastName: "Vivek", email: "vsp6@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "1ec38fd7-ebd1-466f-8a1e-35e4d80694d8", firstName: "Qiu", lastName: "Yarui", email: "yqa39@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "9fe038b7-c4ef-4f33-bead-62e042b4501a", firstName: "Rayudu", lastName: "Gayathri", email: "gra33@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "5b2f1f10-1a64-4a4d-bf82-ea60e6e73fb8", firstName: "Regulagedda", lastName: "Manoj Srivatsav", email: "msr17@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "e83cef46-c876-4848-a170-21ab82843709", firstName: "Sharma", lastName: "Meenakshi", email: "msa458@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "fa7ed2c8-9182-4a95-9af7-ba7a427a2d7d", firstName: "Wang", lastName: "Huayu", email: "huayuw@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "c4789942-25c9-4628-84b6-57ecc5e2dc78", firstName: "Wang", lastName: "Jerry", email: "jyw33@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "758df1ce-1779-40a7-bc28-6a57c3d5e80f", firstName: "Wang", lastName: "Jia", email: "jwa454@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "92424c50-1ba6-4338-aea2-7389b0bb995a", firstName: "Wang", lastName: "Junheng", email: "jwa463@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "e666542d-0786-4a5b-986b-edc2910d3d36", firstName: "Wang", lastName: "Miru", email: "mwa174@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "359b5194-de93-45ac-a0c8-d9aaee8fb700", firstName: "Wani", lastName: "Rutuja", email: "rsw8@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "9c31dbdc-5d57-4f32-9696-b2e44ebac2cd", firstName: "Xiong", lastName: "Haocheng", email: "hxa41@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "92ab5b5d-06ab-48fa-bb4b-82110b7df124", firstName: "Xiong", lastName: "Zhuocheng", email: "zxa59@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "32826185-e315-43d1-b7fd-b164b9ea2458", firstName: "Yang", lastName: "Guoao", email: "gya37@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "d91152a2-13c8-4e8d-8fbc-f5214ca749c7", firstName: "Yemane", lastName: "Alexander", email: "aya119@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "aa49cde9-c2ba-4737-a251-202ac46345fb", firstName: "Zhao", lastName: "Yingqi", email: "yza740@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "70953e82-8d50-4982-a65b-07d1dc0c363d", firstName: "Zhou", lastName: "Ziyi", email: "zza122@sfu.ca", group: "Group 2", org: "MPCS CY'24" },
  { token: "2ff85907-7f4f-4699-b11e-68675f4e8407", firstName: "Tayebi", lastName: "", email: "tayebi@sfu.ca", group: "Group 2", org: "SFU" },
]

const tokenMap = new Map(participants.map((p) => [p.token, p]))

export function getParticipantByToken(token: string): Participant | null {
  return tokenMap.get(token) ?? null
}
