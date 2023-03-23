<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const route = useRouter();

let spaceId = route.currentRoute.value.params;

onMounted(() => {});

// Delete space

const handleDeleteSpace = async (spaceId: string) => {
  try {
    let { data: spaces, error } = await supabase
      .from("spaces")
      .delete()
      .eq("id", spaceId);
    if (spaces) {
    }
    if (error) throw error;
  } catch (error: any) {
    console.log("DELETE SPACE CATCH ERROR: ", error.message);
  }
};
</script>

<template>
  <div class="space-settings">
    <p>spaceSettings</p>
    <p> {{ spaceId }} </p>
  </div>
</template>

<style scoped lang="scss">
.space-settings {
  display: flex;
  align-items: center;
  justify-content: center;

  #main-canvas {
    border: 1px solid blue;
  }
}
</style>
