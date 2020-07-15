import { Language } from "prism-react-renderer"

export interface GithubUser {
  login: string
  avatarUrl: string
}

export interface Snip {
  title: string
  content: string
  id: string
}

export interface FileData {
  filename: string
  language: string
  content: string
}

export interface FilesData {
  [file: string]: FileData
}

export interface GistData {
  id: string
  description: string
  files: FilesData
}
