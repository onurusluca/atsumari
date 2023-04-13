import i18n from "@/utils/i18n";
const { t } = i18n.global;

export const formattedMessageSentTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

  const messages = {
    now: t("times.chatTime.now"),
    oneMinuteAgo: t("times.chatTime.oneMinuteAgo"),
    minutesAgo: t("times.chatTime.minutesAgo"),
    oneHourAgo: t("times.chatTime.oneHourAgo"),
    hoursAgo: t("times.chatTime.hoursAgo"),
    oneDayAgo: t("times.chatTime.oneDayAgo"),
  };

  switch (true) {
    case diffInMinutes < 1:
      return messages.now;
    case diffInMinutes === 1:
      return messages.oneMinuteAgo;
    case diffInMinutes < 60:
      return `${diffInMinutes} ${messages.minutesAgo}`;
    case diffInMinutes < 1440:
      const diffInHours = Math.floor(diffInMinutes / 60);
      return diffInHours === 1
        ? messages.oneHourAgo
        : `${diffInHours} ${messages.hoursAgo}`;
    case diffInMinutes < 10080:
      const diffInDays = Math.floor(diffInMinutes / 1440);
      return diffInDays === 1 ? messages.oneDayAgo : date.toLocaleDateString();

    default:
      return date.toLocaleDateString();
  }
};
