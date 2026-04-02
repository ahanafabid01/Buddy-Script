import { useEffect, useRef, useState } from "react";
import { resolveApiUrl } from "../../api/client";

export function HeaderNavIcon({ name, active = false, className = "" }) {
  if (name === "search") {
    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="#666" />
        <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
      </svg>
    );
  }

  if (name === "home") {
    const homePathClass = active ? "_home_active" : "_home";
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21" aria-hidden="true">
        <path className={homePathClass} stroke="#000" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
        <path className={homePathClass} stroke="#000" strokeOpacity=".6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857" />
      </svg>
    );
  }

  if (name === "friends") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="20" fill="none" viewBox="0 0 26 20" aria-hidden="true">
        <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M12.79 12.15h.429c2.268.015 7.45.243 7.45 3.732 0 3.466-5.002 3.692-7.415 3.707h-.894c-2.268-.015-7.452-.243-7.452-3.727 0-3.47 5.184-3.697 7.452-3.711l.297-.001h.132zm0 1.75c-2.792 0-6.12.34-6.12 1.962 0 1.585 3.13 1.955 5.864 1.976l.255.002c2.792 0 6.118-.34 6.118-1.958 0-1.638-3.326-1.982-6.118-1.982zm9.343-2.224c2.846.424 3.444 1.751 3.444 2.79 0 .636-.251 1.794-1.931 2.43a.882.882 0 01-1.137-.506.873.873 0 01.51-1.13c.796-.3.796-.633.796-.793 0-.511-.654-.868-1.944-1.06a.878.878 0 01-.741-.996.886.886 0 011.003-.735zm-17.685.735a.878.878 0 01-.742.997c-1.29.19-1.944.548-1.944 1.059 0 .16 0 .491.798.793a.873.873 0 01-.314 1.693.897.897 0 01-.313-.057C.25 16.259 0 15.1 0 14.466c0-1.037.598-2.366 3.446-2.79.485-.06.929.257 1.002.735zM12.789 0c2.96 0 5.368 2.392 5.368 5.33 0 2.94-2.407 5.331-5.368 5.331h-.031a5.329 5.329 0 01-3.782-1.57 5.253 5.253 0 01-1.553-3.764C7.423 2.392 9.83 0 12.789 0zm0 1.75c-1.987 0-3.604 1.607-3.604 3.58a3.526 3.526 0 001.04 2.527 3.58 3.58 0 002.535 1.054l.03.875v-.875c1.987 0 3.605-1.605 3.605-3.58S14.777 1.75 12.789 1.75zm7.27-.607a4.222 4.222 0 013.566 4.172c-.004 2.094-1.58 3.89-3.665 4.181a.88.88 0 01-.994-.745.875.875 0 01.75-.989 2.494 2.494 0 002.147-2.45 2.473 2.473 0 00-2.09-2.443.876.876 0 01-.726-1.005.881.881 0 011.013-.721zm-13.528.72a.876.876 0 01-.726 1.006 2.474 2.474 0 00-2.09 2.446A2.493 2.493 0 005.86 7.762a.875.875 0 11-.243 1.734c-2.085-.29-3.66-2.087-3.664-4.179 0-2.082 1.5-3.837 3.566-4.174a.876.876 0 011.012.72z" clipRule="evenodd" />
      </svg>
    );
  }

  if (name === "chat") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="23" height="22" fill="none" viewBox="0 0 23 22" aria-hidden="true">
        <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M11.43 0c2.96 0 5.743 1.143 7.833 3.22 4.32 4.29 4.32 11.271 0 15.562C17.145 20.886 14.293 22 11.405 22c-1.575 0-3.16-.33-4.643-1.012-.437-.174-.847-.338-1.14-.338-.338.002-.793.158-1.232.308-.9.307-2.022.69-2.852-.131-.826-.822-.445-1.932-.138-2.826.152-.44.307-.895.307-1.239 0-.282-.137-.642-.347-1.161C-.57 11.46.322 6.47 3.596 3.22A11.04 11.04 0 0111.43 0zm0 1.535A9.5 9.5 0 004.69 4.307a9.463 9.463 0 00-1.91 10.686c.241.592.474 1.17.474 1.77 0 .598-.207 1.201-.39 1.733-.15.439-.378 1.1-.231 1.245.143.147.813-.085 1.255-.235.53-.18 1.133-.387 1.73-.391.597 0 1.161.225 1.758.463 3.655 1.679 7.98.915 10.796-1.881 3.716-3.693 3.716-9.7 0-13.391a9.5 9.5 0 00-6.74-2.77zm4.068 8.867c.57 0 1.03.458 1.03 1.024 0 .566-.46 1.023-1.03 1.023a1.023 1.023 0 11-.01-2.047h.01zm-4.131 0c.568 0 1.03.458 1.03 1.024 0 .566-.462 1.023-1.03 1.023a1.03 1.03 0 01-1.035-1.024c0-.566.455-1.023 1.025-1.023h.01zm-4.132 0c.568 0 1.03.458 1.03 1.024 0 .566-.462 1.023-1.03 1.023a1.022 1.022 0 11-.01-2.047h.01z" clipRule="evenodd" />
      </svg>
    );
  }

  if (name === "notifications") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22" aria-hidden="true">
        <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd" />
      </svg>
    );
  }

  return null;
}

function ExploreIcon({ name }) {
  switch (name) {
    case "learning":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" aria-hidden="true">
          <path fill="#666" d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm0 1.395a8.605 8.605 0 100 17.21 8.605 8.605 0 000-17.21zm-1.233 4.65l.104.01c.188.028.443.113.668.203 1.026.398 3.033 1.746 3.8 2.563l.223.239.08.092a1.16 1.16 0 01.025 1.405c-.04.053-.086.105-.19.215l-.269.28c-.812.794-2.57 1.971-3.569 2.391-.277.117-.675.25-.865.253a1.167 1.167 0 01-1.07-.629c-.053-.104-.12-.353-.171-.586l-.051-.262c-.093-.57-.143-1.437-.142-2.347l.001-.288c.01-.858.063-1.64.157-2.147.037-.207.12-.563.167-.678.104-.25.291-.45.523-.575a1.15 1.15 0 01.58-.14zm.14 1.467l-.027.126-.034.198c-.07.483-.112 1.233-.111 2.036l.001.279c.009.737.053 1.414.123 1.841l.048.235.192-.07c.883-.372 2.636-1.56 3.23-2.2l.08-.087-.212-.218c-.711-.682-2.38-1.79-3.167-2.095l-.124-.045z" />
        </svg>
      );
    case "insights":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24" aria-hidden="true">
          <path fill="#666" d="M14.96 2c3.101 0 5.159 2.417 5.159 5.893v8.214c0 3.476-2.058 5.893-5.16 5.893H6.989c-3.101 0-5.159-2.417-5.159-5.893V7.893C1.83 4.42 3.892 2 6.988 2h7.972zm0 1.395H6.988c-2.37 0-3.883 1.774-3.883 4.498v8.214c0 2.727 1.507 4.498 3.883 4.498h7.972c2.375 0 3.883-1.77 3.883-4.498V7.893c0-2.727-1.508-4.498-3.883-4.498zM7.036 9.63c.323 0 .59.263.633.604l.005.094v6.382c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094v-6.382c0-.385.286-.697.638-.697zm3.97-3.053c.323 0 .59.262.632.603l.006.095v9.435c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094V7.274c0-.386.286-.698.638-.698zm3.905 6.426c.323 0 .59.262.632.603l.006.094v3.01c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094v-3.01c0-.385.286-.697.638-.697z" />
        </svg>
      );
    case "find-friends":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24" aria-hidden="true">
          <path fill="#666" d="M9.032 14.456l.297.002c4.404.041 6.907 1.03 6.907 3.678 0 2.586-2.383 3.573-6.615 3.654l-.589.005c-4.588 0-7.203-.972-7.203-3.68 0-2.704 2.604-3.659 7.203-3.659zm0 1.5l-.308.002c-3.645.038-5.523.764-5.523 2.157 0 1.44 1.99 2.18 5.831 2.18 3.847 0 5.832-.728 5.832-2.159 0-1.44-1.99-2.18-5.832-2.18zm8.53-8.037c.347 0 .634.282.679.648l.006.102v1.255h1.185c.38 0 .686.336.686.75 0 .38-.258.694-.593.743l-.093.007h-1.185v1.255c0 .414-.307.75-.686.75-.347 0-.634-.282-.68-.648l-.005-.102-.001-1.255h-1.183c-.379 0-.686-.336-.686-.75 0-.38.258-.694.593-.743l.093-.007h1.183V8.669c0-.414.308-.75.686-.75zM9.031 2c2.698 0 4.864 2.369 4.864 5.319 0 2.95-2.166 5.318-4.864 5.318-2.697 0-4.863-2.369-4.863-5.318C4.17 4.368 6.335 2 9.032 2zm0 1.5c-1.94 0-3.491 1.697-3.491 3.819 0 2.12 1.552 3.818 3.491 3.818 1.94 0 3.492-1.697 3.492-3.818 0-2.122-1.551-3.818-3.492-3.818z" />
        </svg>
      );
    case "bookmarks":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24" aria-hidden="true">
          <path fill="#666" d="M13.704 2c2.8 0 4.585 1.435 4.585 4.258V20.33c0 .443-.157.867-.436 1.18-.279.313-.658.489-1.063.489a1.456 1.456 0 01-.708-.203l-5.132-3.134-5.112 3.14c-.615.36-1.361.194-1.829-.405l-.09-.126-.085-.155a1.913 1.913 0 01-.176-.786V6.434C3.658 3.5 5.404 2 8.243 2h5.46zm0 1.448h-5.46c-2.191 0-3.295.948-3.295 2.986V20.32c0 .044.01.088 0 .07l.034.063c.059.09.17.12.247.074l5.11-3.138c.38-.23.84-.23 1.222.001l5.124 3.128a.252.252 0 00.114.035.188.188 0 00.14-.064.236.236 0 00.058-.157V6.258c0-1.9-1.132-2.81-3.294-2.81zm.386 4.869c.357 0 .646.324.646.723 0 .367-.243.67-.559.718l-.087.006H7.81c-.357 0-.646-.324-.646-.723 0-.367.243-.67.558-.718l.088-.006h6.28z" />
        </svg>
      );
    case "group":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );
    case "gaming":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24" aria-hidden="true">
          <path fill="#666" d="M7.625 2c.315-.015.642.306.645.69.003.309.234.558.515.558h.928c1.317 0 2.402 1.169 2.419 2.616v.24h2.604c2.911-.026 5.255 2.337 5.377 5.414.005.12.006.245.004.368v4.31c.062 3.108-2.21 5.704-5.064 5.773-.117.003-.228 0-.34-.005a199.325 199.325 0 01-7.516 0c-2.816.132-5.238-2.292-5.363-5.411a6.262 6.262 0 01-.004-.371V11.87c-.03-1.497.48-2.931 1.438-4.024.956-1.094 2.245-1.714 3.629-1.746a3.28 3.28 0 01.342.005l3.617-.001v-.231c-.008-.676-.522-1.23-1.147-1.23h-.93c-.973 0-1.774-.866-1.785-1.937-.003-.386.28-.701.631-.705zm-.614 5.494h-.084C5.88 7.52 4.91 7.987 4.19 8.812c-.723.823-1.107 1.904-1.084 3.045v4.34c-.002.108 0 .202.003.294.094 2.353 1.903 4.193 4.07 4.08 2.487.046 5.013.046 7.55-.001.124.006.212.007.3.004 2.147-.05 3.86-2.007 3.812-4.361V11.87a5.027 5.027 0 00-.002-.291c-.093-2.338-1.82-4.082-4.029-4.082l-.07.002H7.209a4.032 4.032 0 00-.281-.004l.084-.001zm1.292 4.091c.341 0 .623.273.667.626l.007.098-.001 1.016h.946c.372 0 .673.325.673.725 0 .366-.253.669-.582.717l-.091.006h-.946v1.017c0 .4-.3.724-.673.724-.34 0-.622-.273-.667-.626l-.006-.098v-1.017h-.945c-.372 0-.674-.324-.674-.723 0-.367.254-.67.582-.718l.092-.006h.945v-1.017c0-.4.301-.724.673-.724zm7.058 3.428c.372 0 .674.324.674.724 0 .366-.254.67-.582.717l-.091.007h-.09c-.373 0-.674-.324-.674-.724 0-.367.253-.67.582-.717l.091-.007h.09zm-1.536-3.322c.372 0 .673.324.673.724 0 .367-.253.67-.582.718l-.091.006h-.09c-.372 0-.674-.324-.674-.724 0-.366.254-.67.582-.717l.092-.007h.09z" />
        </svg>
      );
    case "settings":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#666" d="M12.616 2c.71 0 1.388.28 1.882.779.495.498.762 1.17.74 1.799l.009.147c.017.146.065.286.144.416.152.255.402.44.695.514.292.074.602.032.896-.137l.164-.082c1.23-.567 2.705-.117 3.387 1.043l.613 1.043c.017.027.03.056.043.085l.057.111a2.537 2.537 0 01-.884 3.204l-.257.159a1.102 1.102 0 00-.33.356 1.093 1.093 0 00-.117.847c.078.287.27.53.56.695l.166.105c.505.346.869.855 1.028 1.439.18.659.083 1.36-.272 1.957l-.66 1.077-.1.152c-.774 1.092-2.279 1.425-3.427.776l-.136-.069a1.19 1.19 0 00-.435-.1 1.128 1.128 0 00-1.143 1.154l-.008.171C15.12 20.971 13.985 22 12.616 22h-1.235c-1.449 0-2.623-1.15-2.622-2.525l-.008-.147a1.045 1.045 0 00-.148-.422 1.125 1.125 0 00-.688-.519c-.29-.076-.6-.035-.9.134l-.177.087a2.674 2.674 0 01-1.794.129 2.606 2.606 0 01-1.57-1.215l-.637-1.078-.085-.16a2.527 2.527 0 011.03-3.296l.104-.065c.309-.21.494-.554.494-.923 0-.401-.219-.772-.6-.989l-.156-.097a2.542 2.542 0 01-.764-3.407l.65-1.045a2.646 2.646 0 013.552-.96l.134.07c.135.06.283.093.425.094.626 0 1.137-.492 1.146-1.124l.009-.194a2.54 2.54 0 01.752-1.593A2.642 2.642 0 0111.381 2h1.235zm0 1.448h-1.235c-.302 0-.592.118-.806.328a1.091 1.091 0 00-.325.66l-.013.306C10.133 6.07 9 7.114 7.613 7.114a2.619 2.619 0 01-1.069-.244l-.192-.1a1.163 1.163 0 00-1.571.43l-.65 1.045a1.103 1.103 0 00.312 1.464l.261.162A2.556 2.556 0 015.858 12c0 .845-.424 1.634-1.156 2.13l-.156.096c-.512.29-.71.918-.472 1.412l.056.107.63 1.063c.147.262.395.454.688.536.26.072.538.052.754-.042l.109-.052a2.652 2.652 0 011.986-.261 2.591 2.591 0 011.925 2.21l.02.353c.062.563.548 1 1.14 1h1.234c.598 0 1.094-.45 1.14-1l.006-.11a2.536 2.536 0 01.766-1.823 2.65 2.65 0 011.877-.75c.35.009.695.086 1.048.241l.316.158c.496.213 1.084.058 1.382-.361l.073-.111.644-1.052a1.1 1.1 0 00-.303-1.455l-.273-.17a2.563 2.563 0 01-1.062-1.462 2.513 2.513 0 01.265-1.944c.19-.326.451-.606.792-.838l.161-.099c.512-.293.71-.921.473-1.417l-.07-.134-.013-.028-.585-.995a1.157 1.157 0 00-1.34-.513l-.111.044-.104.051a2.661 2.661 0 01-1.984.272 2.607 2.607 0 01-1.596-1.18 2.488 2.488 0 01-.342-1.021l-.014-.253a1.11 1.11 0 00-.323-.814 1.158 1.158 0 00-.823-.34zm-.613 5.284c1.842 0 3.336 1.463 3.336 3.268 0 1.805-1.494 3.268-3.336 3.268-1.842 0-3.336-1.463-3.336-3.268 0-1.805 1.494-3.268 3.336-3.268zm0 1.448c-1.026 0-1.858.815-1.858 1.82 0 1.005.832 1.82 1.858 1.82 1.026 0 1.858-.815 1.858-1.82 0-1.005-.832-1.82-1.858-1.82z" />
        </svg>
      );
    case "save-post":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
      );
    default:
      return null;
  }
}

export function ExploreListItem({ item }) {
  return (
    <li className={`_left_inner_area_explore_item ${item.isNew ? "_explore_item" : ""}`}>
      <a href={item.href} className="_left_inner_area_explore_link">
        <ExploreIcon name={item.icon} />
        <span>{item.label}</span>
      </a>
      {item.isNew ? <span className="_left_inner_area_explore_link_txt">New</span> : null}
    </li>
  );
}

export function NotificationItem({ item }) {
  return (
    <div className="_notification_box">
      <div className="_notification_image">
        <img src={item.image} alt="Image" className="_notify_img" />
      </div>
      <div className="_notification_txt">
        {item.isGroup ? (
          <p className="_notification_para">
            An admin changed the name of the group
            <span className="_notify_txt_link">{item.groupFrom}</span>
            to
            <span className="_notify_txt_link">{item.groupTo}</span>
          </p>
        ) : (
          <p className="_notification_para">
            <span className="_notify_txt_link">{item.name}</span>
            posted a link in your timeline.
          </p>
        )}
        <div className="_nitification_time">
          <span>{item.time}</span>
        </div>
      </div>
    </div>
  );
}

export function LeftSuggestionItem({ person }) {
  return (
    <div className="_left_inner_area_suggest_info">
      <div className="_left_inner_area_suggest_info_box">
        <div className="_left_inner_area_suggest_info_image">
          <a href="profile.html">
            <img src={person.image} alt="Image" className={person.large ? "_info_img" : "_info_img1"} />
          </a>
        </div>
        <div className="_left_inner_area_suggest_info_txt">
          <a href="profile.html">
            <h4 className="_left_inner_area_suggest_info_title">{person.name}</h4>
          </a>
          <p className="_left_inner_area_suggest_info_para">{person.role}</p>
        </div>
      </div>
      <div className="_left_inner_area_suggest_info_link">
        <a href="#0" className="_info_link">Connect</a>
      </div>
    </div>
  );
}

export function EventCard({ eventItem }) {
  return (
    <a className="_left_inner_event_card_link" href="event-single.html">
      <div className="_left_inner_event_card">
        <div className="_left_inner_event_card_iamge">
          <img src={eventItem.image} alt="Image" className="_card_img" />
        </div>
        <div className="_left_inner_event_card_content">
          <div className="_left_inner_card_date">
            <p className="_left_inner_card_date_para">{eventItem.day}</p>
            <p className="_left_inner_card_date_para1">{eventItem.month}</p>
          </div>
          <div className="_left_inner_card_txt">
            <h4 className="_left_inner_event_card_title">{eventItem.title}</h4>
          </div>
        </div>
        <hr className="_underline" />
        <div className="_left_inner_event_bottom">
          <p className="_left_iner_event_bottom">{eventItem.going}</p>
          <span className="_left_iner_event_bottom_link">Going</span>
        </div>
      </div>
    </a>
  );
}

function formatTimeAgo(dateString) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Just now";

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function likedByText(likedBy = []) {
  if (!Array.isArray(likedBy) || likedBy.length === 0) {
    return "No likes yet";
  }

  return likedBy.map((entry) => entry.name).join(", ");
}

function initialsFromName(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function isTextOnlyComment(comment) {
  const content = typeof comment?.content === "string" ? comment.content.trim() : "";
  return content.length > 0 && !comment?.imageUrl;
}

const REACTION_OPTIONS = [
  { id: "like", glyph: "👍", label: "Like" },
  { id: "love", glyph: "❤️", label: "Love" },
  { id: "care", glyph: "🤗", label: "Care" },
  { id: "haha", glyph: "😆", label: "Haha" },
  { id: "wow", glyph: "😮", label: "Wow" },
  { id: "sad", glyph: "😢", label: "Sad" },
  { id: "angry", glyph: "😡", label: "Angry" },
];

const REACTION_ORDER = REACTION_OPTIONS.map((option) => option.id);

function reactionGlyph(reactionType) {
  return REACTION_OPTIONS.find((option) => option.id === reactionType)?.glyph || "👍";
}

function LikerAvatarStack({ likedBy = [], reactionCounts = null, totalCount = 0, size = "md" }) {
  if (totalCount === 0) return null;

  const safeLikedBy = Array.isArray(likedBy) ? likedBy : [];
  const safeReactionCounts = reactionCounts && typeof reactionCounts === "object" ? reactionCounts : null;

  const topReactionTypes = safeReactionCounts
    ? REACTION_ORDER
      .map((reactionType) => ({
        reactionType,
        count: Number(safeReactionCounts[reactionType] || 0),
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((entry) => entry.reactionType)
      .slice(0, 3)
    : [...new Set(safeLikedBy.map((entry) => entry.reactionType || "like"))].slice(0, 3);

  const visibleReactionTypes = topReactionTypes.length > 0 ? topReactionTypes : ["like"];

  return (
    <div className={`liker-avatar-stack size-${size}`} title={likedByText(safeLikedBy)}>
      {visibleReactionTypes.map((reactionType, index) => (
        <span key={`${reactionType}-${index}`} className="liker-avatar-chip liker-reaction-chip" aria-hidden="true">
          {reactionGlyph(reactionType)}
        </span>
      ))}
    </div>
  );
}

function findReactionById(reactionId) {
  return REACTION_OPTIONS.find((option) => option.id === reactionId) || REACTION_OPTIONS[0];
}

const MAX_ATTACHMENT_SIZE_BYTES = 8 * 1024 * 1024;
const TIMELINE_POST_TOGGLE_MIN_LENGTH = 180;

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / (1024 * 102.4)) / 10} MB`;
}

function getAttachmentError(file) {
  if (!file) return null;

  if (!String(file.type || "").startsWith("image/")) {
    return "Only image files are allowed.";
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return "Image must be 8MB or smaller.";
  }

  return null;
}

function AttachmentPreview({ file, onRemove, className = "" }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!file || !previewUrl) return null;

  return (
    <div className={`attachment-preview ${className}`.trim()}>
      <img src={previewUrl} alt="Selected attachment" className="attachment-preview-image" />
      <div className="attachment-preview-meta">
        <p className="attachment-preview-name" title={file.name}>{file.name}</p>
        <p className="attachment-preview-size">{formatFileSize(file.size)}</p>
      </div>
      <button type="button" className="attachment-preview-remove" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

function ReactionAction({
  selectedReaction,
  isActive,
  onSelectReaction,
  onToggleDefault,
  className = "",
  labelClassName = "",
  compact = false,
  showDefaultLikeIcon = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const activeReaction = selectedReaction ? findReactionById(selectedReaction) : findReactionById("like");
  const showReactionEmoji = Boolean(isActive && selectedReaction);

  const clearReactionTimers = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (!openTimerRef.current) {
      openTimerRef.current = setTimeout(() => {
        setMenuOpen(true);
        openTimerRef.current = null;
      }, 80);
    }
  };

  const scheduleClose = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (!closeTimerRef.current) {
      closeTimerRef.current = setTimeout(() => {
        setMenuOpen(false);
        closeTimerRef.current = null;
      }, 220);
    }
  };

  useEffect(() => clearReactionTimers, []);

  return (
    <div
      className={`reaction-action ${compact ? "is-compact" : ""}`}
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={className}
        onClick={(event) => {
          event.preventDefault();
          const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
          if (isTouchDevice && !menuOpen) {
            setMenuOpen(true);
            return;
          }
          onToggleDefault();
        }}
      >
        {showReactionEmoji ? (
          <span className="reaction-trigger-emoji" aria-hidden="true">
            <span className="reaction-trigger-glyph">{activeReaction.glyph}</span>
          </span>
        ) : null}
        {!showReactionEmoji && showDefaultLikeIcon ? (
          <span className="reaction-trigger-emoji" aria-hidden="true">
            <svg className="_reaction_svg reaction-default-like-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7.5 21V9m0 12H5.25A2.25 2.25 0 013 18.75v-6A2.25 2.25 0 015.25 10.5H7.5m0 10.5h7.275c.962 0 1.794-.68 1.987-1.622l1.165-5.7A1.875 1.875 0 0016.09 11.25h-3.84a.75.75 0 01-.75-.75V7.125a3.375 3.375 0 00-3.375-3.375L7.5 10.5"/>
            </svg>
          </span>
        ) : null}
        <span className={labelClassName}>{isActive ? activeReaction.label : "Like"}</span>
      </button>

      <div className={`reaction-picker ${menuOpen ? "show" : ""}`}>
        {REACTION_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`reaction-option ${selectedReaction === option.id ? "is-selected" : ""}`}
            aria-label={option.label}
            title={option.label}
            onClick={(event) => {
              event.preventDefault();
              onSelectReaction(option.id);
              setMenuOpen(false);
            }}
          >
            <span className="reaction-option-glyph">{option.glyph}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CommentThread({
  postId,
  comment,
  depth,
  onCreateComment,
  onToggleCommentLike,
  onOpenCommentReactions,
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyImageFile, setReplyImageFile] = useState(null);
  const [replyImageError, setReplyImageError] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [commentReaction, setCommentReaction] = useState(comment.likes?.viewerReaction || null);
  const replyImageInputRef = useRef(null);

  const replyCount = Number.isFinite(comment.replyCount)
    ? comment.replyCount
    : (comment.replies || []).length;
  const commentTime = formatTimeAgo(comment.createdAt);
  const commentReactionCount = Number(comment.likes?.count || 0);
  const canOpenCommentReactions = commentReactionCount > 0 && typeof onOpenCommentReactions === "function";

  useEffect(() => {
    setCommentReaction(comment.likes?.viewerReaction || null);
  }, [comment.likes?.viewerReaction]);

  const handleCommentReactionSelect = async (reactionId) => {
    if (comment.likes?.likedByViewer && commentReaction === reactionId) {
      await onToggleCommentLike(comment.id, reactionId);
      setCommentReaction(null);
      return;
    }

    await onToggleCommentLike(comment.id, reactionId);

    setCommentReaction(reactionId);
  };

  const handleCommentReactionToggle = async () => {
    if (comment.likes?.likedByViewer) {
      await onToggleCommentLike(comment.id, commentReaction || "like");
      setCommentReaction(null);
      return;
    }
    await onToggleCommentLike(comment.id, "like");
    setCommentReaction("like");
  };

  const handleOpenCommentReactions = () => {
    if (!canOpenCommentReactions) return;
    onOpenCommentReactions(comment.id);
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    const trimmedReply = replyContent.trim();
    if ((!trimmedReply && !replyImageFile) || isSubmittingReply) return;

    try {
      setIsSubmittingReply(true);
      await onCreateComment({
        postId,
        content: trimmedReply,
        parentCommentId: comment.id,
        imageFile: replyImageFile,
      });
      setReplyContent("");
      setReplyImageFile(null);
      setReplyImageError("");
      if (replyImageInputRef.current) {
        replyImageInputRef.current.value = "";
      }
      setShowReplyInput(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReplyGalleryClick = () => {
    replyImageInputRef.current?.click();
  };

  const handleReplyImageChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    const imageError = getAttachmentError(selectedFile);
    if (imageError) {
      setReplyImageError(imageError);
      setReplyImageFile(null);
      if (replyImageInputRef.current) {
        replyImageInputRef.current.value = "";
      }
      return;
    }

    setReplyImageError("");
    setReplyImageFile(selectedFile);
  };

  const handleReplyImageRemove = () => {
    setReplyImageFile(null);
    setReplyImageError("");
    if (replyImageInputRef.current) {
      replyImageInputRef.current.value = "";
    }
  };

  const handleReplyCancel = () => {
    setReplyContent("");
    setReplyImageFile(null);
    setReplyImageError("");
    if (replyImageInputRef.current) {
      replyImageInputRef.current.value = "";
    }
    setShowReplyInput(false);
  };

  return (
    <div className={`comment-thread ${depth > 0 ? "has-parent" : ""}`} style={{ "--thread-depth": depth }}>
      <div className="comment-thread-item">
        <div className="comment-avatar-wrap">
          <img src="/assets/images/comment_img.png" alt="" className="comment-avatar" />
        </div>
        <div className="comment-thread-body">
          <div className="comment-bubble" title={likedByText(comment.likes?.likedBy)}>
            <p className="comment-author">{comment.author?.fullName || "Unknown"}</p>
            {comment.content ? <p className="comment-thread-text">{comment.content}</p> : null}
            {comment.imageUrl ? (
              <div className="comment-image-wrap">
                <img src={resolveApiUrl(comment.imageUrl)} alt="Comment attachment" className="comment-image" />
              </div>
            ) : null}
          </div>
          <div className="comment-thread-meta">
            <ReactionAction
              selectedReaction={commentReaction}
              isActive={Boolean(comment.likes?.likedByViewer)}
              onSelectReaction={handleCommentReactionSelect}
              onToggleDefault={handleCommentReactionToggle}
              className={`comment-link-btn ${comment.likes?.likedByViewer ? "is-active" : ""}`}
              labelClassName="comment-link-btn"
              compact
              showDefaultLikeIcon
            />
            <button type="button" className="comment-link-btn" onClick={() => setShowReplyInput((previous) => !previous)}>
              Reply
            </button>
            <div className="comment-thread-meta-side">
              {commentReactionCount > 0 ? (
                <button
                  type="button"
                  className={`comment-reaction-summary-btn ${canOpenCommentReactions ? "is-clickable" : ""}`}
                  onClick={handleOpenCommentReactions}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleOpenCommentReactions();
                    }
                  }}
                  aria-label={canOpenCommentReactions ? "Open comment reactions" : undefined}
                >
                  <LikerAvatarStack
                    likedBy={comment.likes?.likedBy || []}
                    reactionCounts={comment.likes?.reactionCounts || null}
                    totalCount={commentReactionCount}
                    size="sm"
                  />
                  <span className="comment-reaction-count-text">{commentReactionCount}</span>
                </button>
              ) : null}
              <span className="comment-time">{commentTime}</span>
            </div>
          </div>
          {showReplyInput ? (
            <form onSubmit={handleReplySubmit} className="reply-composer">
              <div className="reply-composer-input-wrap">
                <textarea
                  className="form-control _comment_textarea reply-composer-textarea"
                  placeholder="Write a reply"
                  value={replyContent}
                  onChange={(event) => setReplyContent(event.target.value)}
                />
                <div className="reply-composer-tools">
                  <button type="button" className="comment-tool-btn" aria-label="Attach image" onClick={handleReplyGalleryClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                      <rect width="13.5" height="12" x="2.25" y="3" stroke="currentColor" strokeWidth="1.5" rx="2"/>
                      <circle cx="6.188" cy="7.313" r="1.125" fill="currentColor"/>
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11.25l-2.785-2.227a1.5 1.5 0 00-1.894.037l-3.029 2.599-1.16-.994a1.5 1.5 0 00-1.952.016L2.25 12.375"/>
                    </svg>
                  </button>
                </div>
              </div>
              {replyImageFile ? (
                <div className="reply-attachment-row">
                  <AttachmentPreview file={replyImageFile} onRemove={handleReplyImageRemove} />
                </div>
              ) : null}
              {replyImageError ? <p className="attachment-error-text">{replyImageError}</p> : null}
              <input
                ref={replyImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleReplyImageChange}
                style={{ display: "none" }}
              />
              <div className="reply-composer-actions">
                <button type="button" className="comment-link-btn" onClick={handleReplyCancel}>
                  Cancel
                </button>
                <button type="submit" className="comment-submit-btn" disabled={isSubmittingReply || Boolean(replyImageError) || (!replyContent.trim() && !replyImageFile)}>
                  {isSubmittingReply ? "Replying..." : "Reply"}
                </button>
              </div>
            </form>
          ) : null}

          {replyCount > 0 ? (
            <button type="button" className="comment-view-replies-btn" onClick={() => setShowReplies((previous) => !previous)}>
              {showReplies ? `Hide replies (${replyCount})` : `View replies (${replyCount})`}
            </button>
          ) : null}
        </div>
      </div>

      {showReplies ? (
        <div className="comment-replies">
          {(comment.replies || []).map((reply) => (
            <CommentThread
              key={reply.id}
              postId={postId}
              comment={reply}
              depth={depth + 1}
              onCreateComment={onCreateComment}
              onToggleCommentLike={onToggleCommentLike}
              onOpenCommentReactions={onOpenCommentReactions}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TimelinePost({
  post,
  onTogglePostLike,
  onCreateComment,
  onLoadMoreComments,
  onToggleCommentLike,
  onOpenComments,
  onOpenReactions,
  onOpenCommentReactions,
  initialVisibleTopLevelComments = 2,
  preferTextOnlyCollapsed = false,
}) {
  const [commentContent, setCommentContent] = useState("");
  const [commentImageFile, setCommentImageFile] = useState(null);
  const [commentImageError, setCommentImageError] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const initialVisibleCount = Math.max(1, Number.parseInt(initialVisibleTopLevelComments, 10) || 2);
  const [visibleTopLevelComments, setVisibleTopLevelComments] = useState(initialVisibleCount);
  const [postReaction, setPostReaction] = useState(post.likes?.viewerReaction || null);
  const [isPostTextExpanded, setIsPostTextExpanded] = useState(false);
  const commentImageInputRef = useRef(null);

  const authorName = post.author?.fullName || post.author || "Unknown";
  const visibilityLabel = post.visibility === "private" ? "Private" : "Public";
  const postText = String(post.content || post.title || "").trim();
  const shouldShowPostToggle =
    postText.length > TIMELINE_POST_TOGGLE_MIN_LENGTH || postText.includes("\n");
  const topLevelComments = post.comments || [];
  const loadedHiddenTopLevelCount = Math.max(topLevelComments.length - visibleTopLevelComments, 0);
  const totalTopLevelCount = Number.isFinite(post.topLevelCommentCount)
    ? post.topLevelCommentCount
    : topLevelComments.length;
  const serverHiddenTopLevelCount = Math.max(totalTopLevelCount - topLevelComments.length, 0);
  const baseVisibleComments = loadedHiddenTopLevelCount > 0
    ? topLevelComments.slice(loadedHiddenTopLevelCount)
    : topLevelComments;
  const shouldUseCollapsedTextOnlyPreview =
    preferTextOnlyCollapsed &&
    visibleTopLevelComments === initialVisibleCount &&
    initialVisibleCount === 1;

  const latestTextOnlyComment = shouldUseCollapsedTextOnlyPreview
    ? [...topLevelComments].reverse().find(isTextOnlyComment) || null
    : null;

  const visibleComments = latestTextOnlyComment
    ? [latestTextOnlyComment]
    : baseVisibleComments;

  const hiddenTopLevelCountForButton = shouldUseCollapsedTextOnlyPreview
    ? Math.max(totalTopLevelCount - visibleComments.length, 0)
    : (loadedHiddenTopLevelCount > 0 ? loadedHiddenTopLevelCount : serverHiddenTopLevelCount);

  useEffect(() => {
    setPostReaction(post.likes?.viewerReaction || null);
  }, [post.likes?.viewerReaction]);

  useEffect(() => {
    setIsPostTextExpanded(false);
  }, [post.id, post.content, post.title]);

  const handlePostReactionSelect = async (reactionId) => {
    if (post.likes?.likedByViewer && postReaction === reactionId) {
      await onTogglePostLike(post.id, reactionId);
      setPostReaction(null);
      return;
    }

    await onTogglePostLike(post.id, reactionId);

    setPostReaction(reactionId);
  };

  const handlePostReactionToggle = async () => {
    if (post.likes?.likedByViewer) {
      await onTogglePostLike(post.id, postReaction || "like");
      setPostReaction(null);
      return;
    }
    await onTogglePostLike(post.id, "like");
    setPostReaction("like");
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const trimmedComment = commentContent.trim();
    if ((!trimmedComment && !commentImageFile) || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      await onCreateComment({
        postId: post.id,
        content: trimmedComment,
        parentCommentId: null,
        imageFile: commentImageFile,
      });
      setCommentContent("");
      setCommentImageFile(null);
      setCommentImageError("");
      if (commentImageInputRef.current) {
        commentImageInputRef.current.value = "";
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentGalleryClick = () => {
    commentImageInputRef.current?.click();
  };

  const handleCommentImageChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    const imageError = getAttachmentError(selectedFile);
    if (imageError) {
      setCommentImageError(imageError);
      setCommentImageFile(null);
      if (commentImageInputRef.current) {
        commentImageInputRef.current.value = "";
      }
      return;
    }

    setCommentImageError("");
    setCommentImageFile(selectedFile);
  };

  const handleCommentImageRemove = () => {
    setCommentImageFile(null);
    setCommentImageError("");
    if (commentImageInputRef.current) {
      commentImageInputRef.current.value = "";
    }
  };

  const handleViewPreviousComments = async () => {
    if (loadedHiddenTopLevelCount > 0) {
      setVisibleTopLevelComments(topLevelComments.length);
      return;
    }

    if (!serverHiddenTopLevelCount || !onLoadMoreComments || isLoadingMoreComments) {
      return;
    }

    try {
      setIsLoadingMoreComments(true);
      const loadedCount = await onLoadMoreComments(post.id);
      if (loadedCount > 0) {
        setVisibleTopLevelComments((previous) => previous + loadedCount);
      }
    } finally {
      setIsLoadingMoreComments(false);
    }
  };

  const canOpenReactions = Number(post.likes?.count || 0) > 0 && typeof onOpenReactions === "function";
  const handleOpenReactions = () => {
    if (!canOpenReactions) return;
    onOpenReactions(post.id);
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src="/assets/images/post_img.png" alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{authorName}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatTimeAgo(post.createdAt || post.time)} . <a href="#0">{visibilityLabel}</a>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <button type="button" className="_feed_timeline_post_dropdown_link">
              <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
              </svg>
            </button>
          </div>
        </div>
        {postText ? (
          <div className="timeline-post-copy">
            <h4
              className={`_feed_inner_timeline_post_title timeline-post-copy-text ${isPostTextExpanded ? "is-expanded" : "is-collapsed"}`}
            >
              {postText}
            </h4>
            {shouldShowPostToggle ? (
              <button
                type="button"
                className="timeline-post-copy-toggle"
                onClick={() => setIsPostTextExpanded((previous) => !previous)}
              >
                {isPostTextExpanded ? "See less" : "See more"}
              </button>
            ) : null}
          </div>
        ) : null}
        {post.imageUrl || post.image ? (
          <div className="_feed_inner_timeline_image">
            <img src={post.imageUrl || post.image} alt="" className="_time_img" />
          </div>
        ) : null}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div
          className={`_feed_inner_timeline_total_reacts_image reaction-summary-trigger ${canOpenReactions ? "is-clickable" : ""}`}
          onClick={handleOpenReactions}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleOpenReactions();
            }
          }}
          role={canOpenReactions ? "button" : undefined}
          tabIndex={canOpenReactions ? 0 : undefined}
          aria-label={canOpenReactions ? "Open reactions list" : undefined}
        >
          <LikerAvatarStack
            likedBy={post.likes?.likedBy || []}
            reactionCounts={post.likes?.reactionCounts || null}
            totalCount={post.likes?.count || 0}
            size="md"
          />
          <span className="post-reaction-count-text">{post.likes?.count || 0} reaction{(post.likes?.count || 0) === 1 ? "" : "s"}</span>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1"><span>{post.commentCount || 0}</span> Comment</p>
          <p className="_feed_inner_timeline_total_reacts_para2"><span>{post.shares || 0}</span> Share</p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction">
        <ReactionAction
          selectedReaction={postReaction}
          isActive={Boolean(post.likes?.likedByViewer)}
          onSelectReaction={handlePostReactionSelect}
          onToggleDefault={handlePostReactionToggle}
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${post.likes?.likedByViewer ? "_feed_reaction_active" : ""}`}
          labelClassName="_feed_inner_timeline_reaction_link"
          showDefaultLikeIcon
        />
        <button
          type="button"
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={() => onOpenComments?.(post.id)}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21" aria-hidden="true">
              <path stroke="currentColor" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"/>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563"/>
            </svg>
            Comment
          </span>
        </button>
        <button type="button" className="_feed_inner_timeline_reaction_share _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">
            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21" aria-hidden="true">
              <path stroke="currentColor" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z"/>
            </svg>
            Share
          </span>
        </button>
      </div>

      <div className="_feed_inner_timeline_cooment_area">
        <div className="comment-composer-wrap">
          <form className="comment-composer" onSubmit={handleCommentSubmit}>
            <div className="comment-composer-main">
              <div className="comment-composer-row">
                <div className="comment-avatar-wrap">
                  <img src="/assets/images/comment_img.png" alt="" className="comment-avatar" />
                </div>
                <div className="comment-composer-input-wrap">
                  <textarea
                    className="form-control _comment_textarea comment-composer-textarea"
                    placeholder="Write a comment"
                    value={commentContent}
                    onChange={(event) => setCommentContent(event.target.value)}
                  />
                  <div className="comment-composer-tools">
                    <button type="button" className="comment-tool-btn" aria-label="Attach image" onClick={handleCommentGalleryClick}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                        <rect width="13.5" height="12" x="2.25" y="3" stroke="currentColor" strokeWidth="1.5" rx="2"/>
                        <circle cx="6.188" cy="7.313" r="1.125" fill="currentColor"/>
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11.25l-2.785-2.227a1.5 1.5 0 00-1.894.037l-3.029 2.599-1.16-.994a1.5 1.5 0 00-1.952.016L2.25 12.375"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" className="comment-submit-btn comment-submit-btn-main" disabled={isSubmittingComment || Boolean(commentImageError) || (!commentContent.trim() && !commentImageFile)}>
                <svg className="comment-submit-btn-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 3L10 14"/>
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 3l-7 18-4-7-7-4 18-7z"/>
                </svg>
                <span className="comment-submit-btn-text">{isSubmittingComment ? "Posting..." : "Post"}</span>
              </button>
            </div>
            {commentImageFile ? (
              <div className="comment-attachment-row">
                <AttachmentPreview file={commentImageFile} onRemove={handleCommentImageRemove} />
              </div>
            ) : null}
            {commentImageError ? <p className="attachment-error-text">{commentImageError}</p> : null}
            <input
              ref={commentImageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleCommentImageChange}
              style={{ display: "none" }}
            />
          </form>
        </div>

        {hiddenTopLevelCountForButton > 0 ? (
          <button type="button" className="comments-history-btn" onClick={handleViewPreviousComments} disabled={isLoadingMoreComments}>
            {isLoadingMoreComments
              ? "Loading comments..."
              : loadedHiddenTopLevelCount > 0 || shouldUseCollapsedTextOnlyPreview
                ? `View previous comments${hiddenTopLevelCountForButton > 0 ? ` (${hiddenTopLevelCountForButton})` : ""}`
                : "Load more comments"}
          </button>
        ) : null}

        {visibleComments.map((comment) => (
          <CommentThread
            key={comment.id}
            postId={post.id}
            comment={comment}
            depth={0}
            onCreateComment={onCreateComment}
            onToggleCommentLike={onToggleCommentLike}
            onOpenCommentReactions={onOpenCommentReactions}
          />
        ))}
      </div>
    </div>
  );
}

export function RightFriendItem({ friend }) {
  return (
    <div className={`_feed_right_inner_area_card_ppl ${friend.online ? "" : "_feed_right_inner_area_card_ppl_inactive"}`}>
      <div className="_feed_right_inner_area_card_ppl_box">
        <div className="_feed_right_inner_area_card_ppl_image">
          <a href="profile.html">
            <img src={friend.image} alt="" className="_box_ppl_img" />
          </a>
        </div>
        <div className="_feed_right_inner_area_card_ppl_txt">
          <a href="profile.html">
            <h4 className="_feed_right_inner_area_card_ppl_title">{friend.name}</h4>
          </a>
          <p className="_feed_right_inner_area_card_ppl_para">{friend.role}</p>
        </div>
      </div>
      <div className="_feed_right_inner_area_card_ppl_side">
        {friend.online ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
            <rect width="12" height="12" x="1" y="1" fill="#0ACF83" stroke="#fff" strokeWidth="2" rx="6" />
          </svg>
        ) : (
          <span>{friend.seen}</span>
        )}
      </div>
    </div>
  );
}
