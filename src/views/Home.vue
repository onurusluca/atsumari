<script setup lang="ts">
import type { SpacesType } from '@/api/Types'
import type { OnClickOutsideHandler } from '@vueuse/core'
import { vOnClickOutside } from '@vueuse/components'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

let userSpaces = ref<SpacesType[]>([])
let showContentLoadingPlaceholder = ref<boolean>(true)
let showNoSpacesMessage = ref<boolean>(false)
onMounted(async () => {
  await handleReadSpace()
})

/****************************************
 * API CALLS
 ****************************************/

const handleReadSpace = async () => {
  try {
    let { data: spaces, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('user_id', authStore?.session?.user?.id)
    if (spaces) {
      // Hide loading placeholder
      showContentLoadingPlaceholder.value = false

      userSpaces.value = spaces

      // Show no spaces message if user has no spaces
      if (userSpaces.value.length <= 0) {
        console.log('userSpaces.value.length: ', userSpaces.value.length)

        showNoSpacesMessage.value = true
      } else {
        showNoSpacesMessage.value = false
      }
    }
  } catch (error: any) {
    console.log('READ SPACE CATCH ERROR: ', error.message)
  }
}

// Delete space

const handleDeleteSpace = async (spaceId: string) => {
  try {
    let { data: spaces, error } = await supabase
      .from('spaces')
      .delete()
      .eq('id', spaceId)
    if (spaces) {
      await handleReadSpace()
    }
  } catch (error: any) {
    console.log('DELETE SPACE CATCH ERROR: ', error.message)
  }
}

// Realtime
supabase
  .channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'spaces' },
    async () => {
      console.log('Spaces changed!')
      await handleReadSpace()
    }
  )
  .subscribe()

/****************************************
 * UI
 ****************************************/

// Settings menu dropdown
const settingsMenuDropDownOpen = ref<Boolean>(false)
let settingsMenuDropDownIndex = ref<number>(0)
// Open based on index
const openSettingsMenu = (index: number) => {
  if (settingsMenuDropDownOpen.value === false) {
    settingsMenuDropDownOpen.value = true
  } else if (settingsMenuDropDownOpen.value === true) {
    settingsMenuDropDownOpen.value = false
  }
  settingsMenuDropDownIndex.value = index
}

const clickOutsideHandlersettingsMenuDrowpdown: OnClickOutsideHandler = () => {
  settingsMenuDropDownOpen.value = false
}
</script>

<template>
  <div class="home">
    <ul class="home__spaces" v-if="userSpaces.length > 0"
      ><li v-for="(item, index) in userSpaces" :key="index" class="spaces__space">
        <!-- Top -->
        <div class="space__top">
          <p class="top__title">{{ item.name }}</p>
          <div class="top__space-settings">
            <div @click.stop="openSettingsMenu(index)" class="btn btn-icon">
              <ph:dots-three-outline-fill style="color: black; font-size: 1.2rem" />
            </div>

            <!-- Settings menu -->
            <!-- Language menu dropdown -->
            <Transition name="fade">
              <div
                v-if="settingsMenuDropDownOpen && settingsMenuDropDownIndex === index"
                v-on-click-outside.bubble="clickOutsideHandlersettingsMenuDrowpdown"
                class="space-settings__menu-dropdown dropdown-menu"
              >
                <button class="btn btn-danger" @click="handleDeleteSpace(item.id)">
                  {{ t('space.deleteSpace.title') }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Image -->
        <div class="space__image-container"> </div>

        <!-- Bottom -->
        <div class="space__bottom">
          <div class="bottom__left"></div>
          <div class="bottom__right"></div>
        </div> </li
    ></ul>
    <!-- clp -->
    <div v-if="showContentLoadingPlaceholder" class="clp-container">
      <div class="clp"></div>
      <div class="clp"></div>
      <div class="clp"></div>
      <div class="clp"></div>
    </div>
    <div v-if="showNoSpacesMessage" class="home__no-spaces">
      <p class="no-spaces__message">
        {{ t('home.spaces.noSpacesMessage') }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  padding: 1rem;
  .home__spaces {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    .spaces__space {
      position: relative;

      width: 30rem;
      min-width: 20rem;

      padding: 1rem;

      border: 1px solid var(--border);
      border-radius: $borderRadius;

      .space__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .top__title {
          font-size: 1.2rem;
          font-weight: 600;
        }
        .top__space-settings {
          .space-settings__menu-dropdown {
            position: absolute;
            top: 3.2rem;
            right: 0;
          }
        }
      }
      .space__image-container {
      }
      .space__bottom {
        .bottom__left {
        }
        .bottom__right {
        }
      }
    }
  }
  .home__no-spaces {
    // Center
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 60vh;
    .no-spaces__message {
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--text-300);
    }
  }

  .clp-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    .clp {
      width: 30rem;
      min-width: 20rem;

      padding: 1rem;

      border: 1px solid var(--border);
      border-radius: $borderRadius;
    }
  }
}
</style>
