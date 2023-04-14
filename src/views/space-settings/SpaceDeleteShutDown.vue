<script setup lang="ts">
import ConfirmModal from "@/components/global/ConfirmModal.vue";

const { t } = useI18n();
const authStore = useAuthStore();
const generalStore = useGeneralStore();
const route = useRouter();
const router = useRouter();

const spaceId = String(route.currentRoute.value.params.id);
const spaceName = String(route.currentRoute.value.params.name);

onMounted(() => {});

// Delete space
const handleDeleteSpace = async () => {
  console.log("DELETE SPACE: ", spaceId);
  try {
    let { data: error } = await supabase.from("spaces").delete().eq("id", spaceId);

    if (error) {
      throw error;
    } else {
      console.log("DELETE SPACE SUCCESS: ");

      router.push({ name: "Home" });
    }
  } catch (error: any) {
    console.log("DELETE SPACE CATCH ERROR: ", error.message);
  }
};

let showModal = ref<boolean>(false);
let modalType = ref<string>("");
const onClickDeleteSpace = async () => {
  modalType.value = "deleteSpaceConfirmation";
  showModal.value = true;
};
</script>

<template>
  <div class="delete-shutdown">
    <button @click="onClickDeleteSpace" class="btn btn-danger">{{
      t("buttons.deleteSpace")
    }}</button>
  </div>

  <ConfirmModal
    v-if="showModal"
    :modal-type="modalType"
    :modal-item="spaceName"
    item-type="space"
    @close-confirmation-modal="showModal = false"
    @modal-delete-space-confirmation="handleDeleteSpace"
  />
</template>

<style scoped lang="scss">
.delete-shutdown {
}
</style>
