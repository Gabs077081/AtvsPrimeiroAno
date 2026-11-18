// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================

// COLOQUE AQUI OS DADOS DO SEU PROJETO

const SUPABASE_URL = "SUA_PROJECT_URL";

const SUPABASE_KEY = "SUA_CHAVE_PUBLICA";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// Quantidade inicial de partidas
let numeroPartidas = 3;


// ==========================================
// INICIAR SITE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    carregarTudo
);


async function carregarTudo() {

    await carregarJogadores();

    await carregarClassificacao();

    await carregarHistorico();

}


// ==========================================
// JOGADORES
// ==========================================

async function carregarJogadores() {

    const {
        data,
        error
    } = await supabaseClient
        .from("players")
        .select("*")
        .order("name");


    if (error) {

        mostrarErro(
            "Erro ao carregar jogadores: " +
            error.message
        );

        return;
    }


    const select1 =
        document.getElementById(
            "jogador1"
        );

    const select2 =
        document.getElementById(
            "jogador2"
        );


    select1.innerHTML =
        `<option value="">
            Selecione
        </option>`;

    select2.innerHTML =
        `<option value="">
            Selecione
        </option>`;


    data.forEach(jogador => {

        select1.innerHTML += `
            <option value="${jogador.id}">
                ${escaparHTML(jogador.name)}
            </option>
        `;

        select2.innerHTML += `
            <option value="${jogador.id}">
                ${escaparHTML(jogador.name)}
            </option>
        `;

    });


    const lista =
        document.getElementById(
            "listaJogadores"
        );


    if (data.length === 0) {

        lista.innerHTML = `
            <p class="vazio">
                Nenhum jogador cadastrado.
            </p>
        `;

        return;
    }


    lista.innerHTML = "";


    data.forEach(jogador => {

        lista.innerHTML += `

            <div class="jogador-lista">

                <span>
                    👤
                    ${escaparHTML(jogador.name)}
                </span>

            </div>

        `;

    });

}


// ==========================================
// ADICIONAR JOGADOR
// ==========================================

async function adicionarJogador() {

    const input =
        document.getElementById(
            "nomeJogador"
        );


    const botao =
        document.getElementById(
            "btnAdicionarJogador"
        );


    const nome =
        input.value.trim();


    if (!nome) {

        mostrarErro(
            "Digite o nome do jogador."
        );

        return;
    }


    botao.disabled = true;

    botao.textContent =
        "Adicionando...";


    // Verificar se já existe

    const {
        data: existente
    } = await supabaseClient
        .from("players")
        .select("id")
        .ilike("name", nome)
        .limit(1);


    if (
        existente &&
        existente.length > 0
    ) {

        mostrarErro(
            "Esse jogador já está cadastrado."
        );

        botao.disabled = false;

        botao.textContent =
            "Adicionar jogador";

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("players")
        .insert({
            name: nome
        });


    botao.disabled = false;

    botao.textContent =
        "Adicionar jogador";


    if (error) {

        mostrarErro(
            "Erro ao adicionar jogador: " +
            error.message
        );

        return;
    }


    input.value = "";


    mostrarSucesso(
        "Jogador adicionado!"
    );


    await carregarTudo();

}


// ==========================================
// ADICIONAR PARTIDA
// ==========================================

function adicionarPartida() {

    if (numeroPartidas >= 5) {

        alert(
            "O máximo permitido é 5 partidas."
        );

        return;
    }


    numeroPartidas++;


    const partidas =
        document.getElementById(
            "partidas"
        );


    partidas.innerHTML += `

        <div class="partida">

            <div class="partida-titulo">

                Partida ${numeroPartidas}

            </div>

            <div class="placar">

                <input
                    type="number"
                    min="0"
                    id="p1_${numeroPartidas}"
                    placeholder="0"
                >

                <span>×</span>

                <input
                    type="number"
                    min="0"
                    id="p2_${numeroPartidas}"
                    placeholder="0"
                >

            </div>

        </div>

    `;

}


// ==========================================
// PEGAR RESULTADOS
// ==========================================

function pegarPartidas() {

    const partidas = [];


    for (
        let i = 1;
        i <= numeroPartidas;
        i++
    ) {

        const campo1 =
            document.getElementById(
                `p1_${i}`
            );

        const campo2 =
            document.getElementById(
                `p2_${i}`
            );


        if (
            !campo1 ||
            !campo2
        ) {

            return null;

        }


        const valor1 =
            campo1.value;

        const valor2 =
            campo2.value;


        if (
            valor1 === "" ||
            valor2 === ""
        ) {

            return null;

        }


        const score1 =
            Number(valor1);

        const score2 =
            Number(valor2);


        if (
            score1 < 0 ||
            score2 < 0
        ) {

            return null;

        }


        partidas.push({

            game_number: i,

            score1: score1,

            score2: score2

        });

    }


    return partidas;

}


// ==========================================
// REGISTRAR CONFRONTO
// ==========================================

async function registrarConfronto() {

    const jogador1 =
        document.getElementById(
            "jogador1"
        ).value;


    const jogador2 =
        document.getElementById(
            "jogador2"
        ).value;


    if (
        !jogador1 ||
        !jogador2
    ) {

        mostrarErro(
            "Selecione os dois jogadores."
        );

        return;
    }


    if (
        jogador1 === jogador2
    ) {

        mostrarErro(
            "Um jogador não pode enfrentar ele mesmo."
        );

        return;
    }


    const partidas =
        pegarPartidas();


    if (!partidas) {

        mostrarErro(
            "Preencha o placar de todas as partidas."
        );

        return;
    }


    const botao =
        document.getElementById(
            "btnRegistrar"
        );


    botao.disabled = true;

    botao.textContent =
        "Salvando...";


    // Criar confronto

    const {
        data: confronto,
        error: erroConfronto
    } = await supabaseClient
        .from("matches")
        .insert({

            player1_id:
                Number(jogador1),

            player2_id:
                Number(jogador2)

        })
        .select()
        .single();


    if (erroConfronto) {

        botao.disabled = false;

        botao.textContent =
            "🏆 Registrar confronto";

        mostrarErro(
            "Erro ao criar confronto: " +
            erroConfronto.message
        );

        return;
    }


    // Preparar partidas

    const jogosParaSalvar =
        partidas.map(partida => ({

            match_id:
                confronto.id,

            game_number:
                partida.game_number,

            score1:
                partida.score1,

            score2:
                partida.score2

        }));


    // Salvar partidas

    const {
        error: erroJogos
    } = await supabaseClient
        .from("games")
        .insert(jogosParaSalvar);


    if (erroJogos) {

        // Tenta apagar o confronto
        // se as partidas falharem

        await supabaseClient
            .from("matches")
            .delete()
            .eq(
                "id",
                confronto.id
            );


        botao.disabled = false;

        botao.textContent =
            "🏆 Registrar confronto";

        mostrarErro(
            "Erro ao salvar partidas: " +
            erroJogos.message
        );

        return;
    }


    botao.disabled = false;

    botao.textContent =
        "🏆 Registrar confronto";


    mostrarSucesso(
        "Confronto registrado com sucesso!"
    );


    limparConfronto();


    await carregarTudo();

}


// ==========================================
// LIMPAR CONFRONTO
// ==========================================

function limparConfronto() {

    document.getElementById(
        "jogador1"
    ).value = "";


    document.getElementById(
        "jogador2"
    ).value = "";


    for (
        let i = 1;
        i <= numeroPartidas;
        i++
    ) {

        const campo1 =
            document.getElementById(
                `p1_${i}`
            );

        const campo2 =
            document.getElementById(
                `p2_${i}`
            );


        if (campo1) {
            campo1.value = "";
        }

        if (campo2) {
            campo2.value = "";
        }

    }

}


// ==========================================
// CLASSIFICAÇÃO
// ==========================================

async function carregarClassificacao() {

    const {
        data: jogadores,
        error: erroJogadores
    } = await supabaseClient
        .from("players")
        .select("*");


    const {
        data: confrontos,
        error: erroConfrontos
    } = await supabaseClient
        .from("matches")
        .select("*");


    const {
        data: jogos,
        error: erroJogos
    } = await supabaseClient
        .from("games")
        .select("*");


    if (
        erroJogadores ||
        erroConfrontos ||
        erroJogos
    ) {

        return;
    }


    const ranking = {};


    // Criar jogadores no ranking

    jogadores.forEach(jogador => {

        ranking[jogador.id] = {

            id:
                jogador.id,

            nome:
                jogador.name,

            pontos:
                0,

            confrontos:
                0,

            vitorias:
                0,

            gols:
                0

        };

    });


    // Analisar confrontos

    confrontos.forEach(
        confronto => {

            const partidas =
                jogos.filter(
                    jogo =>
                        jogo.match_id ===
                        confronto.id
                );


            if (
                partidas.length === 0
            ) {

                return;

            }


            const jogador1 =
                ranking[
                    confronto.player1_id
                ];


            const jogador2 =
                ranking[
                    confronto.player2_id
                ];


            if (
                !jogador1 ||
                !jogador2
            ) {

                return;

            }


            jogador1.confrontos++;

            jogador2.confrontos++;


            let vitorias1 = 0;

            let vitorias2 = 0;


            let gols1 = 0;

            let gols2 = 0;


            partidas.sort(
                (a, b) =>
                    a.game_number -
                    b.game_number
            );


            partidas.forEach(
                partida => {

                    gols1 +=
                        partida.score1;

                    gols2 +=
                        partida.score2;


                    if (
                        partida.score1 >
                        partida.score2
                    ) {

                        vitorias1++;

                    }

                    else if (
                        partida.score2 >
                        partida.score1
                    ) {

                        vitorias2++;

                    }

                }
            );


            jogador1.gols += gols1;

            jogador2.gols += gols2;


            jogador1.vitorias +=
                vitorias1;

            jogador2.vitorias +=
                vitorias2;


            // ==================================
            // 1 OU 2 PARTIDAS
            // ==================================

            if (
                partidas.length <= 2
            ) {

                if (
                    vitorias1 >
                    vitorias2
                ) {

                    jogador1.pontos++;

                }

                else if (
                    vitorias2 >
                    vitorias1
                ) {

                    jogador2.pontos++;

                }

                else {

                    // Empate em vitórias:
                    // gols totais decidem

                    if (
                        gols1 >
                        gols2
                    ) {

                        jogador1.pontos++;

                    }

                    else if (
                        gols2 >
                        gols1
                    ) {

                        jogador2.pontos++;

                    }

                }

            }


            // ==================================
            // 3, 4 OU 5 PARTIDAS
            // ==================================

            else {

                let vitoriasMelhorDe3_1 =
                    0;

                let vitoriasMelhorDe3_2 =
                    0;


                // Apenas as 3 primeiras

                for (
                    let i = 0;
                    i < 3;
                    i++
                ) {

                    if (
                        partidas[i].score1 >
                        partidas[i].score2
                    ) {

                        vitoriasMelhorDe3_1++;

                    }

                    else if (
                        partidas[i].score2 >
                        partidas[i].score1
                    ) {

                        vitoriasMelhorDe3_2++;

                    }

                }


                // Ponto da melhor de 3

                if (
                    vitoriasMelhorDe3_1 >
                    vitoriasMelhorDe3_2
                ) {

                    jogador1.pontos++;

                }

                else if (
                    vitoriasMelhorDe3_2 >
                    vitoriasMelhorDe3_1
                ) {

                    jogador2.pontos++;

                }


                // Partidas extras

                for (
                    let i = 3;
                    i < partidas.length;
                    i++
                ) {

                    if (
                        partidas[i].score1 >
                        partidas[i].score2
                    ) {

                        jogador1.pontos++;

                    }

                    else if (
                        partidas[i].score2 >
                        partidas[i].score1
                    ) {

                        jogador2.pontos++;

                    }

                }

            }

        }
    );


    // Transformar em lista

    const lista =
        Object.values(ranking);


    // ==================================
    // ORDEM DO RANKING
    // ==================================

    lista.sort(
        (a, b) => {

            // Primeiro: pontos

            if (
                b.pontos !==
                a.pontos
            ) {

                return (
                    b.pontos -
                    a.pontos
                );

            }


            // Segundo: vitórias

            if (
                b.vitorias !==
                a.vitorias
            ) {

                return (
                    b.vitorias -
                    a.vitorias
                );

            }


            // Terceiro: gols

            return (
                b.gols -
                a.gols
            );

        }
    );


    const tabela =
        document.getElementById(
            "tabelaClassificacao"
        );


    tabela.innerHTML = "";


    if (
        lista.length === 0
    ) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="vazio"
                >
                    Nenhum jogador cadastrado.
                </td>

            </tr>

        `;

        return;
    }


    lista.forEach(
        (jogador, indice) => {

            let classe = "";

            if (
                indice === 0
            ) {

                classe =
                    "primeiro";

            }

            else if (
                indice === 1
            ) {

                classe =
                    "segundo";

            }

            else if (
                indice === 2
            ) {

                classe =
                    "terceiro";

            }


            tabela.innerHTML += `

                <tr>

                    <td
                        class="posicao ${classe}"
                    >
                        ${indice + 1}º
                    </td>

                    <td>
                        ${escaparHTML(
                            jogador.nome
                        )}
                    </td>

                    <td class="pontos">
                        ${jogador.pontos}
                    </td>

                    <td>
                        ${jogador.confrontos}
                    </td>

                    <td>
                        ${jogador.vitorias}
                    </td>

                    <td>
                        ${jogador.gols}
                    </td>

                </tr>

            `;

        }
    );

}


// ==========================================
// HISTÓRICO
// ==========================================

async function carregarHistorico() {

    const {
        data: confrontos,
        error
    } = await supabaseClient
        .from("matches")
        .select(`
            id,
            created_at,
            player1:player1_id(name),
            player2:player2_id(name)
        `)
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        return;
    }


    const {
        data: jogos
    } = await supabaseClient
        .from("games")
        .select("*");


    const historico =
        document.getElementById(
            "historico"
        );


    if (
        !confrontos ||
        confrontos.length === 0
    ) {

        historico.innerHTML = `

            <p class="vazio">

                Nenhum confronto registrado.

            </p>

        `;

        return;
    }


    historico.innerHTML = "";


    confrontos.forEach(
        confronto => {

            const partidas =
                jogos
                    .filter(
                        jogo =>
                            jogo.match_id ===
                            confronto.id
                    )
                    .sort(
                        (a, b) =>
                            a.game_number -
                            b.game_number
                    );


            let html = `

                <div class="historico-item">

                    <div class="historico-titulo">

                        ${escaparHTML(
                            confronto.player1.name
                        )}

                        ×

                        ${escaparHTML(
                            confronto.player2.name
                        )}

                    </div>

            `;


            partidas.forEach(
                partida => {

                    html += `

                        <div class="jogo-historico">

                            <span>
                                Partida
                                ${partida.game_number}
                            </span>

                            <strong>
                                ${partida.score1}
                                ×
                                ${partida.score2}
                            </strong>

                        </div>

                    `;

                }
            );


            html += `</div>`;


            historico.innerHTML += html;

        }
    );

}


// ==========================================
// MENSAGENS
// ==========================================

function mostrarSucesso(texto) {

    const mensagem =
        document.getElementById(
            "mensagem"
        );


    mensagem.innerHTML = `

        <div class="mensagem-sucesso">

            ✅ ${escaparHTML(texto)}

        </div>

    `;


    setTimeout(
        () => {

            mensagem.innerHTML = "";

        },
        4000
    );

}


function mostrarErro(texto) {

    const mensagem =
        document.getElementById(
            "mensagem"
        );


    mensagem.innerHTML = `

        <div class="mensagem-erro">

            ❌ ${escaparHTML(texto)}

        </div>

    `;

}


// ==========================================
// SEGURANÇA BÁSICA DE TEXTO
// ==========================================

function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;

}