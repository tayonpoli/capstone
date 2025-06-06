FROM node:23-alpine AS base

WORKDIR /work 

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

FROM debian:bullseye-slim

WORKDIR /work

COPY --from=base /work/package*.json ./
COPY --from=base /work/node_modules ./node_modules
COPY --from=base /work/.next ./.next
COPY --from=base /work/public ./public
COPY --from=base /work/prisma ./prisma
COPY --from=base /work/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["npm", "run", "start"]
