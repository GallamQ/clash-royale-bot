import { ClanMember } from "../db/members";
import { WarLogRow } from "../db/warLogs";

type PodiumStep = {
  place: 1 | 2 | 3;
  fame: number;
  players: ClanMember[];
};

function buildPodium(warLogs: WarLogRow[], membersByTag: Map<string, ClanMember>): PodiumStep[] {
    //récupérer les scores des membres et effectuer un tri DESC, puis récupérer les 3 plus hautes valeurs dans un Set pour éviter les doublons;

    //attribuer les 3 scores aux 3 marches du podium, chercher les joueurs qui ont ces scores et les stocker par marche;

    //retourner le podium;

}