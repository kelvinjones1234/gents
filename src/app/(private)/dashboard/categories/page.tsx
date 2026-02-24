import React, { Suspense } from 'react'
import Main from './components/Main'
import { Loader2 } from 'lucide-react' // Using the loader you already have in the project

const CategoriesPage = () => {
  return (
    <div>
      {/* Wrapping Main in Suspense fixes the 'useSearchParams()' error.
          The fallback can be a simple spinner or even null.
      */}
      <Suspense fallback={
        <div className="flex w-full h-[50vh] items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
        </div>
      }>
        <Main />
      </Suspense>
    </div>
  )
}

export default CategoriesPage