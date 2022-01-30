import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import { createClient } from "@supabase/supabase-js";
import React from "react";
import appConfig from "../config.json";
import { useRouter } from "next/router";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzM5Mzc0MSwiZXhwIjoxOTU4OTY5NzQxfQ.O2PGwqdzOjvpaBvQ062zSWJApO6vY3ogZ4MYhP1WvBk";
const SUPABASE_URL = "https://qxmgammcsdfppsuktlcn.supabase.co";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
  return supabaseClient
    .from("mensagens")
    .on("INSERT", (respostaLive) => {
      adicionaMensagem(respostaLive.new);
    })
    .subscribe();
}

export default function ChatPage() {
  const roteamento = useRouter();
  const usuarioLogado = roteamento.query.username;
  const [mensagem, setMensagem] = React.useState("");
  const [listaDeMensagens, setListaDeMensagens] = React.useState([]);

  React.useEffect(() => {
    supabaseClient
      .from("mensagens")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data }) => {
        console.log("Dados da consulta:", data);
        setListaDeMensagens(data);
      });

    const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
      setListaDeMensagens((valorAtualDaLista) => {
        return [novaMensagem, ...valorAtualDaLista];
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function validaMensagem(mensagemParaValidar) {
    console.log("Texte de validação:", mensagemParaValidar.length);
    if (mensagemParaValidar.length === 0) {
      return false;
    } else if (!mensagemParaValidar.trim()) {
      return false;
    } else {
      return true;
    }
  }

  function handleNovaMensagem(novaMensagem) {
    const mensagem = {
      id: listaDeMensagens.length + 1,
      de: `${usuarioLogado}`,
      texto: novaMensagem,
    };

    supabaseClient
      .from("mensagens")
      .insert([mensagem])
      .then(({ data }) => {
        console.log("Criando mensagem: ", data);
      });

    setMensagem("");
  }

  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "gray",
        backgroundImage: `url(https://assets.b9.com.br/wp-content/uploads/2021/10/Round6-themoviedb-1280x720.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
          border: "1px solid",
        }}
      >
        <Header value={usuarioLogado} />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
            border: "1px solid",
          }}
        >
          <MessageList mensagens={listaDeMensagens} />
          {/* {listaDeMensagens.map((mensagemAtual) => {
                        return (
                            <li key={mensagemAtual.id}>
                                {mensagemAtual.de}: {mensagemAtual.texto}
                            </li>
                        )
                    })} */}

          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              value={mensagem}
              onChange={(event) => {
                console.log(event);
                const valor = event.target.value;
                setMensagem(valor);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleNovaMensagem(mensagem);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[999],
              }}
            />
            {/*CallBack*/}
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                //console.log('[USANDO O COMPONENTE] Salva esse sticker no banco', sticker);
                handleNovaMensagem(`:sticker: ${sticker}`);
              }}
            />
            <Button
              colorVariant="positive"
              iconName="arrowRight"
              buttonColors={{
                contrastColor: appConfig.theme.colors.neutrals["000"],
                mainColor: appConfig.theme.colors.primary[500],
                mainColorLight: appConfig.theme.colors.primary[400],
                mainColorStrong: appConfig.theme.colors.primary[600],
              }}
              // label=""
              onClick={(event) => {
                if (validaMensagem(mensagem)) {
                  if (event.target) {
                    handleNovaMensagem(mensagem);
                  }
                }
              }}
              styleSheet={{
                borderRadius: "50%",
                padding: "0 3px 0 0",
                minWidth: "50px",
                minHeight: "50px",
                fontSize: "20px",
                marginBottom: "8px",
                marginLeft: "8px",
                lineHeight: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                filter: React.onMouseOver ? "grayscale(0)" : "grayscale(0)",
                hover: {
                  filter: "grayscale(0)",
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header(logado) {
  const user = logado.value;
  console.log(`testa ${user}:`);
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          styleSheet={{
            width: "100%",
            marginBottom: "16px",
            display: "inline-block",
            alignItems: "center",
            justifyContent: "left",
          }}
        >
          <Image
            styleSheet={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              display: "flex",
              marginRight: "8px",
              alignItems: "left",
            }}
            src={`https://github.com/${user}.png`}
          />
          <Text variant="heading5">{user}</Text>
        </Box>

        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
          buttonColors={{
            contrastColor: appConfig.theme.colors.neutrals["000"],
            mainColor: appConfig.theme.colors.primary[500],
            mainColorLight: appConfig.theme.colors.primary[400],
            mainColorStrong: appConfig.theme.colors.primary[600],
          }}
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  console.log("MessageList", props);

  const handleDeletaMensagem = props.handleDeletaMensagem;
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column-reverse",
        flex: 1,
        // color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
      }}
    >
      {props.mensagens.map((mensagem) => {
        return (
          <Text
            key={mensagem.id}
            tag="li"
            styleSheet={{
              borderRadius: "5px",
              padding: "6px",
              marginBottom: "12px",
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: "8px",
              }}
            >
              <Image
                styleSheet={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
                src={`https://github.com/${mensagem.de}.png`}
              />
              <Text
                tag="a"
                href={`https://github.com/${mensagem.de}`}
                target="_blank"
                styleSheet={{
                  color: appConfig.theme.colors.neutrals[200],
                  textDecoration: "none",
                  hover: {
                    color: appConfig.theme.colors.primary[500],
                  },
                }}
              >
                {mensagem.de}
              </Text>
              <Text
                styleSheet={{
                  fontSize: "10px",
                  marginLeft: "8px",
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {new Date().toLocaleDateString()}
              </Text>
            </Box>
            {/*[Declarativo}*/}
            {mensagem.texto.startsWith(":sticker:") ? (
              <Image
                src={mensagem.texto.replace(":sticker:", " ")}
                styleSheet={{
                  height: "150px",
                }}
              />
            ) : (
              mensagem.texto
            )}
          </Text>
        );
      })}
    </Box>
  );
}
