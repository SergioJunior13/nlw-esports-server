import express from "express";
import cors from "cors";

import { PrismaClient } from "@prisma/client";
import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

const prisma = new PrismaClient();

app.get("/games", async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          Ads: true,
        },
      },
    },
  });
  return res.json(games);
});

app.post("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id;
  const body = req.body;

  const ad = await prisma.ads.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(","),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    },
  });

  return res.status(201).json(ad);
});

app.get("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id;

  const ads = await prisma.ads.findMany({
    select: {
      id: true,
      name: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
      useVoiceChannel: true,
      weekDays: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res.json(
    ads.map(ad => {
      return {
        ...ad,
        hourEnd: convertMinutesToHourString(ad.hourEnd),
        weekDays: ad.weekDays.split(","),
        hourStart: convertMinutesToHourString(ad.hourStart),
      };
    })
  );
});

app.get("/ads/:id/discord", async (req, res) => {
  const adId = req.params.id;
  const discord = await prisma.ads.findUniqueOrThrow({
    where: {
      id: adId,
    },
    select: {
      discord: true,
    },
  });

  return res.json(discord);
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log("Server started in port ", port));
